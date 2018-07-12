<?php

/**
 * @file
 * Contains \Drupal\awe_builder\AweBuilder\AweBuilderImport.
 */
namespace Drupal\awe_builder\AweBuilder;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Database\Connection;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use ZipArchive;
use Drupal\image\Entity\ImageStyle;

class AweBuilderImport implements ContainerInjectionInterface {

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

  public function importBuilderData($file, $type = 'page') {
    $this->zip_name = "{$type}s";
    if (!empty($file)) {
      $zipLocal = $this->fileSystem->realpath($file->getFileUri());
      $zip = new ZipArchive();
      $x = $zip->open($zipLocal);
      if ($x === TRUE) {
        $zip->extractTo('public://');
        $zip->close();
        file_delete($file->get('fid')->value);

        //load file image
        $pattern = $this->fileSystem->realpath("public://{$this->folder_name}/images") . '/*';
        $listImages = glob($pattern);
        $structureData = file_get_contents(file_create_url("public://{$this->folder_name}/settings.json"));
        $structureData = Json::decode($structureData);
        if (isset($structureData['list_images'])) {
          $listPreImages = $structureData['list_images'];
          unset($structureData['list_images']);
        }
        else {
          $listPreImages = array();
        }
        // upload images
        $listUpload = $this->uploadImages($listImages, $listPreImages);

        //replace new images
        if (isset($structureData[0]['build_data'])) {
          foreach ($structureData as $key => &$item) {
            $buildData = unserialize($item['build_data']);
            // update image cover for template
            if (isset($item['cover'])) {
              $cover = (array) unserialize($item['cover']);
              if ($cover['fid'] > 0) {
                $filename = $this->getFileName($cover['uri']);
                if(isset($listUpload[$filename]))
                  $item['cover'] = serialize($listUpload[$filename]);
              }
            }
            $this->updateImageForElement($buildData, $listUpload);
            $item['build_data'] = serialize($buildData);
          }
        }
        else {
          $this->updateImageForElement($structureData, $listUpload);
        }

        // delete folder and files
        file_unmanaged_delete_recursive($this->fileSystem->realpath("public://{$this->folder_name}"));
        return $structureData;
      }
    }
  }

  protected function uploadImages($images, $listPreImages) {
    $listExistImage = $this->getListExistImages($listPreImages);
    
    $location = "public:/";
    $list_upload = array();
    foreach ($images as $image) {
      $image_arr = explode('/', $image);
      $file_name = array_pop($image_arr);
      if(!isset($listExistImage[$file_name])){
        $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $file_name_last = file_munge_filename($file_name, $ext);
        $file_content = file_get_contents($image);
        $file = file_save_data($file_content, "$location/$file_name_last");
        $image = (object) NULL;
        $image->url = $file->url();
        $image->fid = $file->id();
        $image->uri = $file->getFileUri();
        $image->libraryThumbnail = ImageStyle::load('thumbnail')->buildUrl($file->getFileUri());
        $image->is_new = TRUE;
        $list_upload[$file_name] = $image;
      }
    }
    return $list_upload;
  }
  
  function getListExistImages($listPreImages){    
    $listExistImage = array();
    foreach($listPreImages as $image){
      $fileUrl = $this->fileSystem->realpath($image['uri']);
      if(file_exists($fileUrl)){
        $filename = $this->getFileName($image['uri']);
        $listExistImage[$filename] = true;
      }
    }
    return $listExistImage;
  }

  protected function updateImageForElement(&$elements, $listUpload = []) {
    $file = [];
    if (isset($elements[0])) {
      foreach ($elements as &$element) {
        $this->updateImageForElement($element, $listUpload);
      }
    }
    else {
      if (isset($elements['settings'])) {
        $settings = Json::decode($elements['settings']);
        foreach ($settings as $key => &$part) {
          // get image from style
          if (isset($part['style']) && count($part['style'])) {
            $this->updateImageStyle($part['style'], $listUpload);
          }
          // get image from settings
          if (isset($part['settings']) && count($part['settings'])) {
            $this->updateImageSettings($part['settings'], $listUpload);
          }
        }
        
        $elements['settings'] = Json::encode($settings);
        if (isset($elements['renderedStyle']) && isset($elements['renderedStyle']['styles']) && !empty($elements['renderedStyle']['styles'])) {
          $this->updateRenderedStyle($elements['renderedStyle']['styles'], $listUpload);
        }
        if (isset($elements['content'])) {
          $this->updateImageForElement($elements['content'], $listUpload);
        }
      }
    }
    return $file;
  }

  protected function updateImageStyle(&$style, $listUpload) {
    foreach ($style as &$status) {
      if (isset($status['background']['image']) && count($status['background']['image'])) {
        $background = $status['background'];
        foreach ($background['image']['file'] as $screen => $data) {
          if ($data['fid'] > 0) {
            $filename = $this->getFileName($data['uri']);
            if(isset($listUpload[$filename]))
              $status['background']['image']['file'][$screen] = $listUpload[$filename];
          }
        }
      }
    }
  }

  protected function getFileName($uri) {
    $uri_arr = explode('://', $uri);
    $uri_arr = explode('/', $uri_arr[1]);
    return array_pop($uri_arr);
  }

  protected function updateImageSettings(&$settings, $listUpload) {
    foreach ($settings as $field => &$data) {
      if (is_array($data) && !empty($data)) {
        if (isset($data['fid'])) {
          if ($data['fid'] > 0) {
            $filename = $this->getFileName($data['uri']);
            if (isset($listUpload[$filename])) {
              $settings[$field] = $listUpload[$filename];
            }
          }
        }
        else {
          $this->updateImageSettings($data, $listUpload);
        }
      }
    }
  }

  protected function updateRenderedStyle(&$renderedStyle, $listUpload) {
    foreach ($renderedStyle as &$style) {
      if (isset($style['background-image']) && $style['background-image']) {
        $filename = $this->getFileName($style['background-image']);
        $filename = str_replace(');', '', $filename);
        if(isset($listUpload[$filename]))
          $style['background-image'] = 'background-image:url(' . $listUpload[$filename]->url . ');';
      }
    }
  }

}