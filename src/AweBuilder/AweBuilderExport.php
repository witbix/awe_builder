<?php

/**
 * @file
 * Contains \Drupal\awe_builder\AweBuilder\AweBuilderExport.
 */
namespace Drupal\awe_builder\AweBuilder;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Database\Connection;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\File\FileSystemInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use ZipArchive;

class AweBuilderExport implements ContainerInjectionInterface{

  protected $zip_name;

  protected $folder_name;

  protected $connection;

  protected $fileSystem;

  public function __construct(Connection $connection, FileSystemInterface $fileSystem) {
    $this->zip_name = 'pages';
    $this->folder_name = 'awebuilder-data';
    $this->connection = $connection;
    $this->fileSystem = $fileSystem;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      $container->get('file_system')
    );
  }

  /**
   * Export file zip from data builder
   * @param array $data builder
   * @param string $type builder (page, section, template)
   * @return mixed file zip
   */
  public function exportBuilder($data, $type) {
    $filesExport = [];
    $this->zip_name = "{$type}s";

    if (!empty($data)) {
      foreach ($data as $item) {
        $buildData = unserialize($item['build_data']);
        if (isset($item['cover'])) {
          $cover = (array) unserialize($item['cover']);
          if ($cover['fid'] > 0) {
            $filesExport = array_merge($filesExport, array($cover));
          }
        }
        $filesExport = array_merge($filesExport, $this->getImageFromElement($buildData));
      }
      $filesExport = $this->removeSameImages($filesExport);
      $data['list_images'] = $filesExport;
      $file_data = Json::encode($data);
      $zip = $this->createFileBuilderZip(array(
        'images' => $filesExport,
        'data' => $file_data
      ));
      return $zip;
    }
    else {
      return FALSE;
    }
  }

  /**
   * @param $elements
   * @return array files images
   */
  protected function getImageFromElement($elements) {
    $file = [];
    if (isset($elements[0])) {
      foreach ($elements as $element) {
        $file = array_merge($file, $this->getImageFromElement($element));
      }
    }
    else {
      if (isset($elements['settings'])) {
        $settings = Json::decode($elements['settings']);
        foreach ($settings as $key => $part) {
          // get image from style
          if (isset($part['style']) && count($part['style'])) {
            $file = array_merge($file, $this->getImageFromStyle($part['style']));
          }
          // get image from settings
          if (isset($part['settings']) && count($part['settings'])) {
            $file = array_merge($file, $this->getImageFromSettings($part['settings']));
          }
        }
        if (isset($elements['content'])) {
          $file = array_merge($file, $this->getImageFromElement($elements['content']));
        }
      }
    }

    return $file;
  }

  /**
   * @param array $style of element
   * @return array file images
   */
  protected function getImageFromStyle($style) {
    $file = array();
    foreach ($style as $status) {
      if (isset($status['background']['image']) && count($status['background']['image'])) {
        $background = $status['background'];
        foreach ($background['image']['file'] as $screen => $data) {
          if ($data['fid'] > 0) {
            $file[] = $data;
          }
        }
      }
    }

    return $file;
  }

  /**
   * @param array $settings of element
   * @return array list files images
   */
  protected function getImageFromSettings($settings) {
    $file = array();
    foreach ($settings as $field => $data) {
      if (is_array($data) && !empty($data)) {
        if (isset($data['fid'])) {
          if ($data['fid'] > 0) {
            $file[] = $data;
          }
        }
        else {
          $file = array_merge($file, $this->getImageFromSettings($data));
        }
      }
    }

    return $file;
  }

  /**
   * @param $files
   * @return array $files unique images
   */
  protected function removeSameImages($files) {
    $result = array();
    foreach ($files as $file) {
      $result[$file['fid']] = $file;
    }
    sort($result);
    return $result;
  }

  /**
   * @param $exportData
   * @return $
   */
  protected function createFileBuilderZip($exportData) {
    // create list files
    $all_files = array();
    foreach ($exportData['images'] as $image) {
      $real_path = $this->fileSystem->realpath($image['uri']);
      $uri_array = explode("://", $image['uri']);
      $uri_array = explode("/", $uri_array[1]);
      $all_files[$real_path] = "{$this->folder_name}/images/" . $uri_array[count($uri_array) - 1];
    }

    // cretate file zip
    $zip_name = $this->zip_name . '_' . REQUEST_TIME ;
    $destination = sprintf('public://%s.zip', $zip_name);
    $kq = $this->create_zip($all_files, $exportData['data'],  $destination);
    return $kq;
  }


  protected function create_zip($files = array(), $data, $destination = '', $overwrite = FALSE) {
    //if the zip file already exists and overwrite is false, return false
    if (file_exists($destination) && !$overwrite) {
      return FALSE;
    }
    $valid_files = array();

    if (is_array($files)) {
      foreach ($files as $local_file => $file) {
        if (@file_exists($local_file)) {
          $valid_files[$local_file] = $file;
        }
      }
    }
    //if we have good files...
    if (extension_loaded('zip')) {
      $zip = new ZipArchive();
      // check destination is not real path
      $real_path = $this->fileSystem->realpath($destination);

      if ($zip->open($real_path, $overwrite ? ZIPARCHIVE::OVERWRITE : ZIPARCHIVE::CREATE) !== TRUE) {
        return FALSE;
      }
      //add the files
      foreach ($valid_files as $local_file => $file) {
        $zip->addFile($local_file, $file);
      }
      $zip->addFromString("{$this->folder_name}/settings.json", $data);

      $zip->close();
      //check to make sure the file exists
      $file_exists = file_exists($destination);
      if ($file_exists) {
        return $destination;
      }
      else {
        drupal_set_message(t('create file zip fail'));
        return FALSE;
      }
    }
    else {
      drupal_set_message(t('no extension zip'));
      return FALSE;
    }
  }

}