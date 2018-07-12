<?php

/**
 * @file
 * Contains \Drupal\awe_page\Controller\AweMediaController.
 */
namespace Drupal\awe_builder\Controller;

use Drupal\awe_builder\AweBuilder\AweBuilderRender;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Connection;
use Drupal\Core\Database\Query\Condition;
use Drupal\Core\Url;
use Drupal\image\Entity\ImageStyle;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

class AweTemplatesController extends ControllerBase {

  /**
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;


  /**
   * AweTemplatesController constructor.
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


  public function actionsTemplate() {
    $uid = $uid = \Drupal::currentUser()->id();
    $type = (isset($_POST['type']) && $_POST['type']) ? $_POST['type'] : 'section';

    switch ($_POST['requestAction']) {
      case 'get':
        if (isset($_POST['id'])) {
          $temp_data = $this->connection->select('awe_template', 'templates')
            ->fields('templates')
            ->condition('tid', $_POST['id'])
            ->execute()
            ->fetchAssoc();
          $temp_data['id'] = $temp_data['tid'];
          $temp_data['favorite'] = (int)$temp_data['favorite'];
          $temp_data['data'] = Json::decode($temp_data['data']);
          $temp_data['cover'] = unserialize($temp_data['cover']);
          return new JsonResponse([
            'template' => $temp_data,
            'status' => TRUE
          ]);
        }
        else {
          $templates = [
            'templates' => [],
            'loadMore' => TRUE
          ];
          $themeTemplate = _awebuilder_get_theme_templates($type, 'array');
          $countThemeTemplate = count($themeTemplate);
          $loadTemplateFromDatabase = true;
          $templatesFromDb = [];
          $countNewTemplateTheme = 0;
          $from = isset($_POST['from']) ? $_POST['from'] : 0;
          $showedTemplate = $from;
          $numberItemOnPage = isset($_POST['length']) ? $_POST['length'] : 5;
          
          if($from < $countThemeTemplate){
            $countHiddenTemplate = $countThemeTemplate - $from;
            if($from)
              $countHiddenTemplate++;
            if($countHiddenTemplate >= $numberItemOnPage){
              // only load template from theme
              for($i = $from; $i < ($from + $numberItemOnPage); $i++){
                $themeTemplate[$i]->cover = (array) json_decode($themeTemplate[$i]->cover);
                $themeTemplate[$i]->id = $themeTemplate[$i]->tid;
                $templates['templates'][] = $themeTemplate[$i];
              }
              $loadTemplateFromDatabase = false;
              $countNewTemplateTheme = $numberItemOnPage;
            }else if($countHiddenTemplate > 0){
              // load template from theme & db
              for($i = $from; $i < $countThemeTemplate; $i++){
                $themeTemplate[$i]->cover = (array) json_decode($themeTemplate[$i]->cover);
                $themeTemplate[$i]->id = $themeTemplate[$i]->tid;
                $templates['templates'][] = $themeTemplate[$i];
              }
              if($from){
                $from = 0;
              }
              $countNewTemplateTheme = $countHiddenTemplate;
              $numberItemOnPage -= $countHiddenTemplate;
            }
          }else{
            // only load template from db
            $from -= $countThemeTemplate;
          }
          $condition = new Condition('AND');
          $condition->condition('type', $type);
          $templatesFromDb = $this->connection->select('awe_template', 'templates')
            ->fields('templates')
            ->condition($condition)
            ->range($from, $numberItemOnPage)
            ->orderBy('tid', 'DESC')
            ->execute()
            ->fetchAll(\PDO::FETCH_ASSOC);
          
          if ($from == 0 && $type=='page') {
            $templates['templates'][] = [
              'title' => 'blank template',
              'cover' => array('url' => ''),
              'data' => '',
              'category' => 'custom'
            ];
          }

          foreach ($templatesFromDb as $template) {
            $template['id'] = $template['tid'];
            $template['favorite'] = (int)$template['favorite'];
            $template['cover'] = (array) unserialize($template['cover']);
            $template['data'] = Json::decode($template['data']);
            if ($uid == $template['uid'] && !$template['category']) {
              $template['category'] = t('My templates');
            }
            $templates['templates'][] = $template;
          }
          if (count($templates['templates']) < $numberItemOnPage) {
            $templates['loadMore'] = FALSE;
          }
          else {
            $total = count($this->connection->select('awe_template', 'templates')->fields('templates')->condition($condition)->execute()->fetchAll());
            if(($showedTemplate + $countNewTemplateTheme + count($templatesFromDb)) >= ($total + $countThemeTemplate))
                $data['load_more'] = false;
          }
          return new JsonResponse($templates);
        }
        break;

      case 'save':
        // write templates data files
        $data = array(
          'uid' => $uid,
          'title' => $_POST['title'],
          'type' => $type,
          'category' => '',
          'data' => $_POST['data'],
          'created' => time()
        );
        if (isset($_FILES['cover'])) {
          $files = AweMediaController::aweSaveFile($_FILES['cover']);
          $data['cover'] = serialize($files['file']);
        }
        else {
          $data['category'] = 'custom';
          if (isset($_POST['cover']) && is_array($_POST['cover'])) {
            $data['cover'] = serialize((object) $_POST['cover']);
          }
        }

        if (isset($_POST['id']) && $_POST['id'] > 0) {
          $this->connection->update('awe_template')
            ->fields($data)
            ->condition('tid', $_POST['id'])
            ->execute();
          $data['tid'] = $_POST['id'];
          $temp_data = $this->connection->select('awe_template', 'templates')
              ->fields('templates')
              ->condition('tid', $_POST['id'])
              ->execute()
              ->fetchAssoc();
          $data['favorite'] = (int)$temp_data['favorite'];
          if (!isset($data['cover']) || empty($data['cover'])) {            
            $data['cover'] = $temp_data['cover'];            
          }
        }
        else {
          $data['tid'] = $this->connection->insert('awe_template')
            ->fields($data)
            ->execute();
          $data['favorite'] = 0;
        }
        // response data
        $data['cover'] = unserialize($data['cover']);
        $data['id'] = $data['tid'];
        $data['data'] = Json::decode($data['data']);

        return new JsonResponse([
          'template' => $data,
          'status' => TRUE
        ]);
        break;

      case 'delete':
        if(intval($_POST['id'])){
          $result['status'] = $this->connection->delete('awe_template')
            ->condition('tid', $_POST['id'])
            ->execute();
          return new JsonResponse($result);
        }
        break;
      case 'setFavorite':
        $response = array('status' => FALSE);
        if (isset($_POST['type']) && $_POST['type'] === 'section' && isset($_POST['id']) && $_POST['id']) {
            // set state
            $favorite = (isset($_POST['state']) && $_POST['state'] == 'true') ? 1 : 0;
            $result = $this->connection->update('awe_template')->fields(array('favorite'=>$favorite))->condition('tid', $_POST['id'])->execute();
            if($result)
              $response['status'] = TRUE;
        }
        return new JsonResponse($response);
    }

  }

  public function getTemplates($type) {
    $start = 0;
    if (isset($_POST['currentTemplates']) && isset($_POST['act']) && $_POST['act'] == 'loadTemplates') {
      // Return templates data for ajax load
      $start = intval($_POST['currentTemplates']);
    }

    // Get 12 newest template in database
    $data = $this->loadTemplates($type, [
      'start' => $start,
      'length' => 12
    ]);

    if (isset($_POST['currentTemplates']) && isset($_POST['act']) && $_POST['act'] == 'loadTemplates') {
      // Return templates data for ajax load
      return new JsonResponse($data);
    }
    else {
      $config = AweBuilderRender::getAweUrlConfig();
      $config['buildPage'] = Url::fromRoute(
        'awe_builder.admin.template.iframe',
        ['absolute' => TRUE])
        ->toString();

      return [
        '#theme' => 'awe_templates',
        '#data' => $data,
        '#attached' => [
          'library' => [
            'awe_builder/awe_builder.template',
            'awe_builder/toolbar.fix'
          ],
          'drupalSettings' => [
            'aweBuilderTemplateType' => $type,
            'aweBuilderTemplateSettings' => $config,
            'getPlaceBlock' => Url::fromRoute('awe_builder.admin.place_block', [], ['absolute' => TRUE])
              ->toString(),
            'getListBlock' => Url::fromRoute('awe_builder.admin.list_block', [], ['absolute' => TRUE])
              ->toString(),
          ]
        ]
      ];
    }
  }

  public function viewPageTemplate() {
    return [
      '#type' => 'page',
      '#theme' => 'page',
      '#attached' => [
        'library' => [
          'awe_builder/awe_builder.iframe',
        ]
      ],
      'content' => [
        '#markup' => '<div class="js-ac-page-wrapper ac_page-wrapper awe-page-wrapper ac_guides"></div>'
      ]
    ];
  }

  protected function loadTemplates($type, $options = NULL) {
    $uid = \Drupal::currentUser()->id();
    $themeTemplate = _awebuilder_get_theme_templates($type);
    $countThemeTemplate = count($themeTemplate);
    $loadTemplateFromDatabase = true;
    $templatesFromDb = [];
    $countNewTemplateTheme = 0; 
    $data = array('templates' => array(), 'load_more' => TRUE, 'type' => $type);
    $from = isset($options['start']) ? $options['start'] : 0;
    $showedTemplate = $from;
    $numberItemOnPage = isset($options['length']) ? $options['length'] : 12;    
    if($from < $countThemeTemplate){
      $countHiddenTemplate = $countThemeTemplate - $from;
      if($from)
        $countHiddenTemplate++;
      if($countHiddenTemplate >= $numberItemOnPage){
        // only load template from theme
        for($i = $from; $i < ($from + $numberItemOnPage); $i++){
          $data['templates'][] = $themeTemplate[$i];
        }
        $loadTemplateFromDatabase = false;
        $countNewTemplateTheme = $numberItemOnPage;
      }else if($countHiddenTemplate > 0){
        // load template from theme & db
        for($i = $from; $i < $countThemeTemplate; $i++){
          $data['templates'][] = $themeTemplate[$i];
        }
        if($from){
          $from = 0;
        }
        $countNewTemplateTheme = $countHiddenTemplate;
        $numberItemOnPage -= $countHiddenTemplate;
      }
    }else{
      // only load template from db
      $from -= $countThemeTemplate;
    }
    
    if($loadTemplateFromDatabase){
      $condition = new Condition('AND');
      $condition->condition('type', $type);
      if (isset($options['my_template']) && $options['my_template']) {
        $condition->condition('uid', $uid);
      }
      $templatesFromDb = $this->connection->select('awe_template', 'templates')
        ->fields('templates')
        ->condition($condition)
        ->range($from, $numberItemOnPage)
        ->execute()
        ->fetchAll();
      foreach ($templatesFromDb as &$template) {
        $thumb = unserialize($template->cover);
        $template->cover = Json::encode($thumb);
        $template->thumbnail = ($thumb) ? $thumb->url : '';
        if (!isset($template->classes)) {
          $template->classes = $template->category;
        }

        if ($template->uid == $uid) {
          $template->classes .= ' own-template';
        }

        if($template->favorite)
          $template->classes .= ' favorite';
      }
      
      $data['templates'] = array_merge($data['templates'], $templatesFromDb);
    }
    
    if (count($data['templates']) < $numberItemOnPage) {
      $data['load_more'] = FALSE;
    }else{
      $total = count($this->connection->select('awe_template', 'templates')->fields('templates')->condition($condition)->execute()->fetchAll());
      if(($showedTemplate + $countNewTemplateTheme + count($templatesFromDb)) >= ($total + $countThemeTemplate))
          $data['load_more'] = false;
    }
    return $data;
  }
}