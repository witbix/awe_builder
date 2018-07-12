<?php

/**
 * @file
 * Contains \Drupal\awe_builder\Form\AweBuilderUpdateHostForm.
 */
namespace Drupal\awe_builder\Form;

use Drupal\awe_builder\AweBuilder\AweBuilderLibraries;
use Drupal\awe_builder\AweBuilder\AweBuilderRenderStyle;
use Drupal\awe_builder\AweBuilder\AweBuilderUpdateHost;
use Drupal\awe_page\AwePageManagerInterface;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class AweBuilderUpdateHostForm extends FormBase {

  /**
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * @var \Drupal\awe_page\AwePageManagerInterface
   */
  protected $awePageManager;

  /**
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  public function __construct(Connection $connection, ConfigFactoryInterface $configFactory) {
    $this->connection = $connection;
    if(\Drupal::moduleHandler()->moduleExists('awe_page'))      
      $this->awePageManager = \Drupal::service('awe_page.manager');    
    $this->configFactory = $configFactory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      //$container->get('awe_page.manager'),
      $container->get('config.factory')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'awe_update_host';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    global $base_url;
    $config = $this->configFactory->get('awe_builder.settings');
    $form['old_host'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Old base URL'),
      '#required' => TRUE,
      '#default_value' => $config->get('old_host'),
      // '#descriptions' => $this->t('This url'),
      '#disabled' => $config->get('old_host') ? $config->get('old_host') : FALSE,
    ];

    $form['new_host'] = [
      '#type' => 'textfield',
      '#title' => $this->t('New base URL'),
      '#required' => TRUE,
      '#default_value' => $base_url,
      // '#descriptions' => $this->t('New base URL')
    ];

    $form['update'] = [
      '#type' => 'submit',
      '#value' => $this->t('Update Link')
    ];

    return $form;
  }

  public function validateForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    if ($values['old_host'] == $values['new_host']) {
      $form_state->setErrorByName('Update', $this->t('Same URL, nothing update.'));
    }
  }


  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // change host for awe page
    $values = $form_state->getValues();
    $this->updateLinksByNewBaseUrl($values['old_host'], $values['new_host']);
    drupal_set_message($this->t('Your base URL has been successfully updated.'));
  }
  
  public function updateLinksByNewBaseUrl($oldBaseUrl, $newBaseUrl){
    $config = $this->configFactory->getEditable('awe_builder.settings');
    $convert = new AweBuilderUpdateHost($oldBaseUrl, $newBaseUrl);
    // change host for awe template
    $this->changeUrlImageFromTemplates($convert);
    // change host for awe page
    $this->changeUrlImageFromPages($convert);
    // change host for awe field
    $this->changeUrlImageFromFields($convert);

    //Update host
    $config->set('old_host', $newBaseUrl);
    $config->save();

    // Flushes all caches.
    drupal_flush_all_caches();
  }
  
  private function changeUrlImageFromTemplates($convert){
    $templates = $this->connection->select('awe_template', 'm')->fields('m')->execute()->fetchAll(\PDO::FETCH_ASSOC);
    foreach($templates as $temp){
      $data = Json::decode($temp['data']);
      $fields = [];
      $fields['data'] = Json::encode($convert->convertData($data));
      
      $cover = unserialize($temp['cover']);
      if(!empty($cover)){
        $cover->url = str_replace($convert->getOldBaseUrl(), $convert->getNewBaseUrl(), $cover->url);
        $cover->libraryThumbnail = str_replace($convert->getOldBaseUrl(), $convert->getNewBaseUrl(), $cover->libraryThumbnail);
        $fields['cover'] = serialize($cover);
      }
      $this->connection->update('awe_template')->fields($fields)->condition('tid', $temp['tid'])->execute();
    }
  }
  
  private function changeUrlImageFromPages($convert){
    if($this->awePageManager){
      $awepages = $this->awePageManager->findAll();
      $new_pages = $convert->convertData($awepages);
      //Update Page
      foreach ($new_pages as $index => $new_page) {
        $settings = unserialize($new_page['settings']);
        // Get libraries of page
        $libraries = new AweBuilderLibraries($new_page['build_data']);
        $files = $libraries->getLibraries();
        // Save css file
        $style = new AweBuilderRenderStyle($new_page['build_data'], 'ac-wrapper-page-' . $new_page['pid']);
        $css = $style->saveFileCss('page', "awe_page_{$new_page['pid']}");
        $files['css']['theme'][$css] = [];
        $settings['libraries'] = $files;

        $new_page['settings'] = serialize($settings);
        $new_page['build_data'] = serialize($new_page['build_data']);
        $this->awePageManager->updateAwePage($new_page, $new_page['pid']);
      }
    }
  }
    
  private function changeUrlImageFromFields($convert){
    $aweFields = $this->getDataFields();
    $new_fields = $convert->convertData($aweFields);
    //Update Fields
    $this->updateDataFields($new_fields);
  }

  protected function updateDataFields($fields) {
    foreach ($fields as $index => $field) {
      // Get libraries of field
      $libraries = new AweBuilderLibraries($field['build_data']);
      $files = $libraries->getLibraries();

      $id = $field['entity_id'];
      $table = "{$field['entity_type']}__{$field['field_name']}";
      $entityType = $field['entity_type'];
      $bundle = $field['bundle'];
      $wrap_class = "ac-wrapper-field-{$entityType}_{$bundle}_{$id}";

      $style = new AweBuilderRenderStyle($field['build_data'], $wrap_class);

      $css = $style->saveFileCss('field', "awe_field_{$entityType}_{$bundle}_{$id}");
      $files['css']['theme'][$css] = [];

      $config = \Drupal::service('config.factory')
        ->getEditable('awe_field.libraries');

      $config->set("awe_field_{$entityType}_{$bundle}_{$id}", serialize($files));
      $config->save();

      $field[$field['field_name'] . '_value'] = Json::encode($field['build_data']);
      unset($field['build_data']);
      unset($field['entity_type']);
      unset($field['field_name']);

      $this->connection->update($table)
        ->fields($field)
        ->condition('bundle', $bundle)
        ->condition('entity_id', $id)
        ->condition('delta', $field['delta'])
        ->execute();
    }
  }

  protected function getDataFields() {
    $fields = \Drupal::service('entity_field.manager')->getFieldMapByFieldType('field_awe_builder');
    $field_data = [];
    foreach ($fields as $type => $field) {
      foreach ($field as $name => $data) {
        $table = "{$type}__{$name}";
        $current_data = $this->connection->select($table, 'awf')
          ->fields('awf')
          ->execute()
          ->fetchAll(\PDO::FETCH_ASSOC);
        $current_data =  $this->formatDataField($current_data, $type, $name);
        $field_data = array_merge($field_data, $current_data);
      }
    }
    return $field_data;
  }

  protected function formatDataField(&$data, $type, $name) {
    foreach ($data as $index => &$field) {
      $field['build_data'] = Json::decode($field["{$name}_value"]);
      $field['build_data'] = serialize($field['build_data']);
      $field['entity_type'] = $type;
      $field['field_name'] = $name;
      unset($field["{$name}_value"]);
    }
    return $data;
  }
}