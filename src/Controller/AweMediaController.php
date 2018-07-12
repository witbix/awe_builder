<?php

/**
 * @file
 * Contains \Drupal\awe_page\Controller\AweMediaController.
 */
namespace Drupal\awe_builder\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Connection;
use Drupal\image\Entity\ImageStyle;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Database\Query\Condition;

class AweMediaController extends ControllerBase {

  /**
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * AweMediaController constructor.
   * @param \Drupal\Core\Database\Connection $connection
   */
  public function __construct(Connection $connection) {
    $this->connection = $connection;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database')
    );
  }

  public function uploadMedia() {
    $response = $this->aweSaveFile($_FILES['awe_file']);
    return new JsonResponse($response);
  }

  public function loadLibraryMedia() {
    $response = [];
    $type = isset($_POST['type']) ? $_POST['type'] : 'all';
    $pageNumber = isset($_POST['pageNumber']) ? $_POST['pageNumber'] : 0;
    $numberItemOnPage = 15;
    $conditions = new Condition('AND');
    $condition_str = '';
    $condition_st_params = array();
    if (isset($type) && $type == 'myfile') {
      $user = \Drupal::currentUser();
      $conditions->condition('uid', $user->id());
      $condition_str = " uid = :uid ";
      $condition_st_params[':uid'] = $user->id();
    }
    $conditions->condition('uri', $this->connection->escapeLike('public://') . '%', 'LIKE');
    $condition_str .= $condition_str ? ' and ' : '';
    $condition_str .= " uri like 'public://%'";

    // check file type
    $conditions->condition('filemime', $this->connection->escapeLike('image/') . '%', 'LIKE');
    $condition_str .= $condition_str ? ' and ' : '';
    $condition_str .= " filemime like 'image/%'";

    if (!$pageNumber) {
      $total_files = $this->connection->query('select count(*) from {file_managed} where ' . $condition_str, $condition_st_params)
        ->fetchField();
      $response['totalPages'] = ceil($total_files / $numberItemOnPage);
    }
    else {
      $files = $this->connection->select('file_managed', 'file')
        ->fields('file')
        ->range(($pageNumber - 1) * $numberItemOnPage, $numberItemOnPage)
        ->condition($conditions)
        ->orderBy('created', 'DESC')
        ->execute()
        ->fetchAll(\PDO::FETCH_ASSOC);

      // Add library thumbnail to file
      foreach ($files as $key => $file) {
        $files[$key]['url'] = file_create_url($file['uri']);
      }
      $response = $files;
    }

    return new JsonResponse($response);
  }

  public static function aweSaveFile($file) {
    $output = array(
      'status' => 0,
      'file' => FALSE
    );

    $allow_types = array('image/gif', 'image/png', 'image/jpg', 'image/jpeg');

    // get location save file
    $location = "public:/";

    $sub_folder = \Drupal::config('awe_builder.settings')
      ->get('ac_media_sub_folder');
    $sub_folder = $sub_folder ? $sub_folder : 'awebuilder';

    $file_folder_existed = TRUE;
    if ($sub_folder) {
      $location = sprintf('%s/%s', $location, trim($sub_folder, '/'));
      $file_folder_existed = file_prepare_directory($location, FILE_CREATE_DIRECTORY);
    }

    if ($file_folder_existed) {
      // check $file
      if (!empty($file)) {
        if (in_array($file['type'], $allow_types)) {
          $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
          $filename = $file['name'];
          $file_name_last = file_munge_filename($filename, $ext);
          $file_content = file_get_contents($file['tmp_name']);
          $image = (object) NULL;
          if ($file = file_save_data($file_content, "$location/$file_name_last")) {
            $image->url = $file->url();
            $image->fid = $file->id();
            $image->uri = $file->getFileUri();
            $image->libraryThumbnail = ImageStyle::load('thumbnail')
              ->buildUrl($file->getFileUri());
            $image->is_new = TRUE;
            if (isset($_POST['style'])) {
              $image->style = $_POST['style'] == 'none' ? $image->url : ImageStyle::load($_POST['style'])
                ->buildUrl($file->getFileUri());
            }
            if (isset($_POST['thumb'])) {
              $image->thumb = $_POST['thumb'] == 'none' ? $image->url : ImageStyle::load($_POST['thumb'])
                ->buildUrl($file->getFileUri());
            }
            $output = array(
              'status' => 1,
              'file' => $image
            );
          }
        }
      }
    }

    return $output;
  }

}
