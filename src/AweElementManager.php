<?php

/**
 * @file
 * Contains AweElementManager.
 */
namespace Drupal\awe_builder;

use Drupal\Core\Plugin\DefaultPluginManager;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;

/**
 * AweElement plugin manager.
 */
class AweElementManager extends DefaultPluginManager {

  /**
   * The library discovery service.
   * @var \Drupal\Core\Asset\LibraryDiscoveryInterface
   */
  protected $libraryDiscovery;

  /**
   * Constructs an AweElementManager object.
   *
   * @param \Traversable $namespaces
   *   An object that implements \Traversable which contains the root paths
   *   keyed by the corresponding namespace to look for plugin implementations,
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache_backend
   *   Cache backend instance to use.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler to invoke the alter hook with.
   */
  public function __construct(\Traversable $namespaces, CacheBackendInterface $cache_backend, ModuleHandlerInterface $module_handler) {
    parent::__construct('Plugin/AweElement', $namespaces, $module_handler, 'Drupal\awe_builder\AweElementInterface', 'Drupal\awe_builder\Annotation\AweElement');
    $this->alterInfo('awe_element_info');
    $this->setCacheBackend($cache_backend, 'awe_element');
  }

  /**
   * @return array
   */
  public function getListElement() {
    $element = [];
    foreach ($this->getDefinitions() as $item) {
      $element[$item['name']] = $item['theme'];
    }
    $element['section'] = 'awe_section';
    $element['column'] = 'awe_column';
    $element['el_accordion_item'] = 'el_accordion_item';
    $element['el_tab_item'] = 'el_tab_item';
    $element['el_carousel_item'] = 'el_carousel_item';
    $element['el_masonry_item'] = 'el_masonry_item';
    $element['menubox'] = 'md_menubox';
    $element['menu'] = 'md_menu_item';
    return $element;
  }


  /**
   * Array list Libraries of Awe element
   * @return array list Libraries
   */
  public function getLibrariesInfoName() {
    $plugins = $this->getDefinitions();
    $libraries = [];
    foreach ($plugins as $AweElement) {
      $plugin = $this->createInstance($AweElement['id']);
      $library = $plugin->getLibraries();
      foreach (array_keys($library) as $name) {
        $libraries[] = "{$AweElement['provider']}/{$name}";
      }
    }
    return $libraries;
  }


  public function getLibrariesElements($elements) {
    $plugins = $this->getDefinitions();
    $libraries = [];
    foreach ($plugins as $AweElement) {

      $plugin = $this->createInstance($AweElement['id']);
      $element_name = $plugin->getName();

      if (in_array($element_name, $elements)) {
        $libs = $plugin->defineLibraries();
        if (isset($libs['libraries']) && !empty($libs['libraries'])) {

          foreach ($libs['libraries'] as $name => $library) {

            if (!isset($libraries[$name]) && isset($library['files'])) {
              $library['files'] = $this->getFilesElement($library['files'], $AweElement['provider']);
              $libraries[$name] = $library;
            }

            if (isset($library['files']) && isset($library['version']) && isset($libraries[$name]['version']) && $library['version'] > $libraries[$name]['version']) {
              $library = $this->getFilesElement($library['files'], $AweElement['provider']);
              $libraries[$name] = $library;
            }

          }

        }
      }
    }

    //
    $list_files = [];
    foreach ($libraries as $index => $library) {
      foreach ($library['files'] as $name => $type) {
        if ($type['type'] == 'css') {
          $list_files['css']['theme'][$name]['type'] = 'file';
        }
        else {
          $list_files['js'][$name]['type'] = 'file';
        }
      }
    }

    return $list_files;
  }

  protected function getFilesElement($files, $module_name) {

    foreach ($files as $file_name => $file_data) {
      if (!isset($file_data['external']) || $file_data['external'] == FALSE) {
        unset($files[$file_name]);
        $file_name = '/' .  drupal_get_path('module', $module_name) . '/' . $file_name;
        $files[$file_name] = $file_data;
      }
    }
    return $files;
  }


  /**
   * Process AweElement
   * @return array
   */
  public function getAweElementFiles() {
    $plugins = $this->getDefinitions();
    ksort($plugins);
    $libraries = [];
    $libraries['libraries'] = [];
    $listElementTabs = array('drupalBlocks', 'drupalPlaceBlocks');
    $listFreeElements = array(
      'accordion', 'alert', 'button', 'divider',
      'dropcaps', 'header', 'html', 'icon', 'image', 'list',
      'nested', 'table', 'tabs', 'text',
      'facebook', 'flickr', 'map', 'googleplus', 'pinterest',
      'masonry-grid-images');
    // check buy builder
    $boughtMode = FALSE;
    foreach ($plugins as $AweElement) {
      if (!in_array($AweElement['id'], $listElementTabs) && ((!$boughtMode && in_array($AweElement['id'], $listFreeElements)) || (isset($AweElement['belongTheme']) && $AweElement['belongTheme']) || $boughtMode)) {
        $plugin = $this->createInstance($AweElement['id']);
        $libs = $plugin->defineLibraries();
        foreach ($libs as $key => $data) {
          if ($key == 'libraries') {
            $libs[$key] = $this->processLibrariesElement($data, $AweElement['provider']);
          }
          else {
            $time = '';
            if(in_array($key, ['jsFile', 'jsTemplate']))
                $time = $this->getQueryStringJs ();
            $libs[$key] = file_create_url( drupal_get_path('module', $AweElement['provider']) . '/' . $data).$time;
          }
        }

        $element_name = $plugin->getName();
        $libs['name'] = $element_name;
        if (!isset($libs['libraries'])) {
          $libs['libraries'] = [];
        }
        else {
          $libraries['libraries'] = array_merge($libraries['libraries'], $libs['libraries']);
        }

        $libraries['elements'][$element_name] = $libs;
      }

    }
    return $libraries;
  }
  
  public function getQueryStringJs(){
    $query_string = '?' . (\Drupal::state()->get('system.css_js_query_string') ?: '0');
    return $query_string;
  }

  /**
   * @param $data
   * @param $module_name
   * @return mixed
   */
  protected function processLibrariesElement($data, $module_name) {
    foreach ($data as $name => $info) {
      if (!empty($info['files'])) {
        $files = $info['files'];
        foreach ($files as $file_name => $file_data) {
          if (!isset($file_data['external']) || $file_data['external'] == FALSE) {
            unset($files[$file_name]);
            $file_name = file_create_url(drupal_get_path('module', $module_name) . '/' . $file_name).$this->getQueryStringJs ();
            $files[$file_name] = $file_data;
          }
        }
        $info['files'] = $files;
      }
      $data[$name] = $info;
    }
    return $data;
  }
}