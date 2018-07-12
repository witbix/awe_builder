<?php

/**
 * @file
 * Contains \Drupal\awe_builder\Form\AweImportTemplate.
 */
namespace Drupal\awe_builder\Form;

use Drupal\awe_builder\AweBuilder\AweBuilderImport;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Database\Connection;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

class AweImportTemplate extends FormBase {
  /**
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * @var \Drupal\awe_builder\AweBuilder\AweBuilderImport
   */
  protected $aweImport;

  public function __construct(Connection $connection, AweBuilderImport $aweImport) {
    $this->connection = $connection;
    $this->aweImport = $aweImport;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      $container->get('aw_builder.import')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'awe_import_template';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['import_file'] = array(
      '#type' => 'file',
      '#title' => t('File zip'),
      '#default_value' => ''
    );
    $form['bt_submit'] = array(
      '#type' => 'submit',
      '#default_value' => t('Submit')
    );
    return $form;
  }

  public function validateForm(array &$form, FormStateInterface $form_state) {
    $file = file_save_upload('import_file', array(
      'file_validate_extensions' => array('zip'),
    ));
    if ($file && isset($file[0]) && $file[0]) {
      if ($file = file_move($file[0], 'public://')) {
        // Save the file for use in the submit handler.
        $form_state->setValue('file_upload', $file);
      }
      else {
        $form_state->setErrorByName('import_file', $this->t("Failed to write the uploaded file to the site's file folder."));
      }
    }
    else {
      $form_state->setErrorByName('import_file', $this->t('No file was uploaded.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $file = $form_state->getValue('file_upload');
    $data = $this->aweImport->importBuilderData($file);
    $user = $this->currentUser();
    foreach ($data as $fields) {
      unset($fields['tid']);
      $fields['data'] = Json::encode(unserialize($fields['build_data']));
      unset($fields['build_data']);
      $fields['uid'] = $user->id();
      $fields['created'] = REQUEST_TIME;
      $this->connection->insert('awe_template')
        ->fields($fields)
        ->execute();
    }
    drupal_set_message(t('Import template successfully'));
  }
}