<?php

/**
 * @file
 * Contains \Drupal\awe_builder\Form\AweExportTemplate.
 */
namespace Drupal\awe_builder\Form;

use Drupal\awe_builder\AweBuilder\AweBuilderExport;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Database\Connection;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\file\Entity\File;
use Drupal\image\Entity\ImageStyle;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;

class AweExportTemplate extends FormBase {

  /**
   * @var
   */
  protected $connection;

  /**
   * The date formatter service.
   *
   * @var \Drupal\Core\Datetime\DateFormatterInterface
   */
  protected $dateFormatter;

  /**
   * The export builder service
   * @var \Drupal\awe_builder\AweBuilder\AweBuilderExport
   */
  protected $aweExport;


  public function __construct(Connection $connection, DateFormatterInterface $date_formatter, AweBuilderExport $aweExport) {
    $this->connection = $connection;
    $this->dateFormatter = $date_formatter;
    $this->aweExport = $aweExport;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      $container->get('date.formatter'),
      $container->get('aw_builder.export')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'awe_export_template';
  }

  /**
   * Get all data builder template form database
   * @return array data builder templates
   */
  protected function getAllTemplates() {
    $data = $this->connection->select('awe_template', 'awt')
      ->fields('awt')
      ->execute()
      ->fetchAll(\PDO::FETCH_ASSOC);
    return $data;
  }

  /**
   * Get data builder template from database with condition $tids
   * @param array $tids id of templates
   * @return array $data
   */
  protected function getTemplates($tids) {
    $data = $this->connection->select('awe_template', 'awt')
      ->fields('awt')
      ->condition('tid', $tids, 'IN')
      ->execute()
      ->fetchAll(\PDO::FETCH_ASSOC);
    return $data;
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $templates = $this->getAllTemplates();

    $header = [
      'title' => [
        'data' => $this->t('Title'),
        'specifier' => 'title',
      ],
      'type' => [
        'data' => $this->t('Type'),
        'specifier' => 'type',
      ],
      'image' => $this->t('Image'),
      'author' => $this->t('Author'),
      'created' => [
        'data' => $this->t('Created'),
        'specifier' => 'created',
        'sort' => 'desc',
        'class' => array(RESPONSIVE_PRIORITY_LOW),
      ]
    ];
    $options = [];

    foreach ($templates as $index => $template) {
      $thumb = unserialize($template['cover']);
      $account = User::load($template['uid']);
      $thumbUrl = ImageStyle::load('thumbnail')->buildUrl($thumb->uri);

      $options[$template['tid']] = [
        'tid' => $template['tid'],
        'title' => $template['title'],
        'type' => $template['type'],
        'image' => [
          'data' => [
            '#type' => 'markup',
            '#markup'=> sprintf('<div class="ac-thumb-template"><img src="%s" alt="thumb template %s"</div>', $thumbUrl, $template['title'])
          ],
        ],
        'author' => [
          'data' => [
            '#theme' => 'username',
            '#account' => $account,
          ]
        ],
        'created' => $this->dateFormatter->format($template['created'], 'short'),
      ];
    }

    $form['templates'] = [
      '#type' => 'tableselect',
      '#header' => $header,
      '#options' => $options,
      '#empty' => $this->t('No templates available.'),
    ];

    $form['export'] = [
      '#type' => 'submit',
      '#value' => $this->t('Export')
    ];

    return $form;
  }

  public function validateForm(array &$form, FormStateInterface $form_state) {
    $form_state->setValue('templates', array_diff($form_state->getValue('templates'), array(0)));
    // We can't execute any 'Update options' if no comments were selected.
    if (count($form_state->getValue('templates')) == 0) {
      $form_state->setErrorByName('', $this->t('Select one or more templates to export.'));
    }
  }


  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $tids = $form_state->getValue('templates');
    $templates = $this->getTemplates($tids);
    foreach ($templates as $index => &$template) {
      $data = Json::decode($template['data']);
      $template['build_data'] = serialize($data);
      unset($template['data']);
    }
    $uri = $this->aweExport->exportBuilder($templates, 'template');

    $file = File::create([
      'uid' => 1,
      'uri' => $uri,
      'status' => 0,
    ]);

    $file->save();

    header('Content-disposition: attachment; filename=' . $file->getFilename());
    header('Content-type: application/zip');
    readfile(\Drupal::service('file_system')->realpath($file->getFileUri()));
    exit();
  }
}