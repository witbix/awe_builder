<?php

/**
 * @file
 * Contains \Drupal\awe_page\Routing\ExampleRoutes.
 */
namespace Drupal\awe_builder\Controller;

use Drupal\awe_builder\AweBuilder\AweBuilderRender;
use Drupal\block\Entity\Block;
use Drupal\Core\Asset\LibraryDiscoveryInterface;
use Drupal\Core\Block\BlockManagerInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Plugin\Context\LazyContextRepository;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

class AweBuilderController extends ControllerBase {

  /**
   * The block manager.
   *
   * @var \Drupal\Core\Block\BlockManagerInterface
   */
  protected $blockManager;

  /**
   * The context repository.
   *
   * @var \Drupal\Core\Plugin\Context\LazyContextRepository
   */
  protected $contextRepository;


  /**
   * The library discovery service.
   * @var \Drupal\Core\Asset\LibraryDiscoveryInterface
   */
  protected $libraryDiscovery;

  /**
   * @var \Drupal\awe_builder\AweBuilder\AweBuilderRender
   */
  protected $aweBuilder;

  /**
   * @var \Drupal\system\SystemManager
   */
  protected $systemManager;

  /**
   * AweBuilderController constructor.
   * @param \Drupal\Core\Asset\LibraryDiscoveryInterface $library_discovery
   * @param \Drupal\Core\Block\BlockManagerInterface $block_manager
   * @param \Drupal\Core\Plugin\Context\LazyContextRepository $context_repository
   */
  public function __construct(LibraryDiscoveryInterface $library_discovery, BlockManagerInterface $block_manager, LazyContextRepository $context_repository) {
    $this->libraryDiscovery = $library_discovery;
    $this->blockManager = $block_manager;
    $this->contextRepository = $context_repository;
    $this->aweBuilder = new AweBuilderRender();
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('library.discovery'),
      $container->get('plugin.manager.block'),
      $container->get('context.repository')
    );
  }

  /**
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function placeBlocks() {
    // Only add blocks which work without any available context.
    $definitions = $this->blockManager->getDefinitionsForContexts($this->contextRepository->getAvailableContexts());
    // Order by category, and then by admin label.
    $definitions = $this->blockManager->getSortedDefinitions($definitions);

    $rows = [];

    foreach ($definitions as $plugin_id => $plugin_definition) {
      $row = [];
      $row['title'] = $plugin_definition['admin_label'];
      $row['module'] = $plugin_definition['id'];
      $row['delta'] = $plugin_id;
      $rows[] = $row;
    }

    return new JsonResponse($rows);
  }

  /**
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function listBlocks() {
    $values = [
      'theme' => \Drupal::configFactory()->get('system.theme')->get('default'),
    ];
    $blocks = \Drupal::entityTypeManager()
      ->getListBuilder('block')
      ->getStorage()
      ->loadByProperties($values);
    $rows = [];
    foreach ($blocks as $plugin_id => $plugin_definition) {
      $row = [];
      $row['title'] = $plugin_definition->label();
      $row['module'] = $plugin_definition->getPluginId();
      $row['delta'] = $plugin_id;
      $rows[] = $row;
    }
    return new JsonResponse($rows);
  }

  /**
   * @param $block_id
   * @return array rendered block content
   */
  public function viewBlock($block_id) {
    $block = Block::load($block_id);
    $build = \Drupal::entityTypeManager()
      ->getViewBuilder('block')
      ->view($block);
    return [
      '#type' => 'page',
      'content' => [
        '#region' => 'content',
        $block_id => $build
      ]
    ];
  }

  /**
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function fontSettings() {
    $config = \Drupal::config('awe_builder.settings');
    $fonts = $config->get('ac_google_font');
    $local_font = isset($_POST['google_font']) ? $_POST['google_font'] : '';
    if (empty($fonts) && $local_font) {
      $fonts = $local_font;
    }
    else {
      if ($fonts && $local_font) {
        $local_font_arr = explode('?', $local_font);
        if (count($local_font_arr) == 2) {
          $fonts .= '|'.str_replace('family=', '', $local_font_arr[1]);
        }
      }
    }

    $output['libraries'][$fonts] = array(
      'type' => 'css',
      'destination' => array('frontend', 'backend')
    );

    $query = parse_url($fonts, PHP_URL_QUERY);
    if ($query) {
      $fonts = str_replace('family=', '', $query);
      if ($fonts) {
        $fonts = explode('|', $fonts);
        foreach ($fonts as $font) {
          $font = explode(':', $font);
          $style = isset($font[1]) ? $font[1] : '';
          $font[0] = str_replace('+', ' ', $font[0]);
          $output['data'][$font[0]] = array(
            'title' => $font[0],
            'data' => $this->aweBuilder->getFontStyle($style)
          );
        }
      }
    }

    return new JsonResponse($output);
  }

  /**
   * @return array
   */
  public function menuAweBuilder() {

    $content = [
      'config' => [
        'title' => 'Configuration',
        'options' => [],
        'description' => 'Global configure for core builder. Affect to AweContent & Megamenu',
        'url' => Url::fromRoute('awe_builder.admin.config')
      ],
      'update_host' => [
        'title' => 'Update Link',
        'options' => [],
        'description' => 'You need to run update link if you change site URL',
        'url' => Url::fromRoute('awe_builder.admin.host')
      ],
      'templates' => [
        'title' => 'Templates',
        'options' => [],
        'description' => 'Manage sections & pages templates',
        'url' => Url::fromRoute('awe_builder.admin.template', ['type' => 'section'])
      ]
    ];

    if (\Drupal::moduleHandler()->moduleExists('awe_page')) {
      $content['Pages'] = [
        'title' => 'Pages',
        'options' => [],
        'description' => 'Manage pages build with AweContent',
        'url' => Url::fromRoute('awe_page.admin')
      ];
    }

    return [
      '#theme' => 'admin_block_content',
      '#content' => $content,
    ];
  }

  public function getIcons() {
    $response = [];

    if ($_POST['_action']) {
      if (\Drupal::hasService('md_fontello')) {
        $fontello = \Drupal::service('md_fontello');
        switch ($_POST['_action']) {
          case 'init':
            $response = $fontello->getListFonts();
            break;
          case 'load':
            $library_name = isset($_POST['name']) ? $_POST['name'] : '';
            if ($library_name) {
              $response = $fontello->getInfoFont($library_name);
            }
            break;
        }
      }
    }

    return new JsonResponse($response);
  }


  /**
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function jsonResponse() {
    if (isset($_POST['task']) && $_POST['task'] == 'getTemplate') {
      if (isset($_POST['module']) && isset($_POST['delta'])) {
        $block = Block::load($_POST['delta']);
        $id = '';
        if (!$block) {
          $id = $_POST['module'] . '_' . REQUEST_TIME;
          $values = [
            'id' => $id,
            'plugin' => $_POST['delta'],
            'region' => -1,
            'settings' => [
              'label' => '[AWE]_' . $_POST['title'],
            ],
            'theme' => \Drupal::configFactory()
              ->get('system.theme')
              ->get('default'),
            'visibility' => [],
            'weight' => 0,
          ];

          $block = Block::create($values);
          $block->save();
        }

        $data = \Drupal::entityTypeManager()
          ->getViewBuilder('block')
          ->view($block);

        $template = \Drupal::service('renderer')
          ->render($data);
        $response = [
          'template' => $template,
          'delta' => $id,
          'module' => $_POST['module']
        ];
        return new JsonResponse($response);
      }
      else{
        exit();
      }
    }
    else {
      $manager = \Drupal::service('plugin.manager.awe_element');
      $response = $manager->getAweElementFiles();
      return new JsonResponse($response);
    }
  }

}
