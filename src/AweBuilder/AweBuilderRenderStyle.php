<?php

/**
 * @file
 * Contains \Drupal\awe_builder\AweBuilderRenderStyle.
 */
namespace Drupal\awe_builder\AweBuilder;

use Drupal\Component\Serialization\Json;
use Drupal\Core\StreamWrapper\PublicStream;

class AweBuilderRenderStyle {

  /**
   * Store style data
   * @var array
   */
  protected $css = [
    'normal' => [],
    'lg' => [],
    'md' => [],
    'sm' => [],
    'xs' => [],
  ];
  
  private $wrap_class;


  /**
   * @param array $data : content builder
   * @param $wrap_class
   */
  public function __construct($data, $wrap_class) {
    $this->data = $data;
    $this->wrap_class = $wrap_class;
    $this->renderStyle($data);
  }

  /**
   * Render style awecontent
   * @param $data
   * @param $wrap_class
   */
  protected function renderStyle($data) {
    if(isset($data['machineName'])){
      // fix fo megamenu
      $data = [$data];
    }
    
    foreach ($data as $index => $item) {

      $inner_class = $item['machineName'].'-'.$item['cid'];
      if($item['machineName'] == 'menu'){
        if($item['level'] == 1)
          $inner_class = "awemenu-nav ul.awemenu .{$inner_class}";
        else
          $inner_class = "awemenu-nav .awemenu-item .{$inner_class}";
      }
      $settings = Json::decode($item['settings']);
      $customStyle = Json::decode($item['customStyles']);

      if (isset($item['renderedStyle']) && !empty($item['renderedStyle']['styles'])) {
        $this->getStyleElement($settings, $item['renderedStyle']['styles'], $inner_class);
      }

      if ($customStyle['css']) {
        $this->css['normal'][] = $customStyle['css'];
      }

      if (isset($item['renderedAnimation']) && !empty($item['renderedAnimation'])) {
        $this->getAnimationElement($item['renderedAnimation'], $inner_class);
      }

      if (isset($item['content']) && !empty($item['content'])) {
        $this->renderStyle($item['content']);
      }

    }
  }

  /*
   * method to get one or multi selector for css
   */
  private function getSelectorCss($part_settings, $part_name = 'main', $default_selector, $cssFilter = '') {
    $selector_css = array();
    if (isset($part_settings['selector']) && $part_settings['selector']) {
      $selector_arr = is_array($part_settings['selector']) ? $part_settings['selector'] : explode(',', $part_settings['selector']);
      foreach ($selector_arr as $key => $value) {
        $selector_css[] = $default_selector . ' ' . $value.$cssFilter;
      }
    }
    else {
      if($part_name === 'main')
        $selector_css[] = $default_selector.$cssFilter;
      else 
        $selector_css[] = $default_selector.' .not-child-selector';
    }
    return $selector_css;
  }

  /**
   * Get style of element
   * @param $settings
   * @param $styles
   * @param $selector_css
   */
  protected function getStyleElement($settings, $styles, $selector_css) {
    $selector_css_static = $selector_css;

    foreach ($styles as $selector => $style) {
      if (count($style)) {
        $hasFilter = strpos($selector, '|');
        $cssFilter = '';
        if ($hasFilter) {
          $selector_arr = explode('|', $selector);
          $part = $selector_arr[0];
          $cssFilter = $selector_arr[1];
          $selector_arr = explode('.', $selector_arr[2]);
          $status = $selector_arr[0];
          $screen = $selector_arr[1];
        }
        else {
          $selector_arr = explode('.', $selector);
          $part = $selector_arr[0];
          $status = $selector_arr[1];
          $screen = $selector_arr[2];
        }
        $css_content = implode(' ', $style);
        $part_settings = (isset($settings) && isset($settings[$part])) ? $settings[$part] : [];

        $default_selector = ".{$this->wrap_class} .{$selector_css_static}";
        $selector_css = $this->getSelectorCss($part_settings, $part, $default_selector, $cssFilter);
        if ($status != 'normal') {
          foreach ($selector_css as $key => $val) {
            $hasPoint = strpos($val, ':');
            if($hasPoint){
              $first_selector = substr($val, 0, $hasPoint);
              $last_selector = substr($val, $hasPoint);
              $selector_css[$key] = "{$first_selector}.ac_{$status}{$last_selector}, {$first_selector}:{$status}{$last_selector}";
            } else {
              $selector_css[$key] = "{$val}.ac_{$status}, {$val}:{$status}";
            }
          }
        }
        $joinSelector = implode(', ', $selector_css);

        if (trim($css_content)) {
          switch ($screen) {
            case 'lg':
              $this->css['lg'][] = $joinSelector . '{' . $css_content . '}';
              break;
            case 'md':
              $this->css['md'][] = $joinSelector . '{' . $css_content . '}';
              break;
            case 'sm':
              $this->css['sm'][] = $joinSelector . '{' . $css_content . '}';
              break;
            case 'xs':
              $this->css['xs'][] = $joinSelector . '{' . $css_content . '}';
              break;
            default :
              $this->css['normal'][] = $joinSelector . '{' . $css_content . '}';
          }
        }
      }
    }
  }

  /**
   * Get Style animation
   * @param $animations
   * @param $selector_css
   */
  protected function getAnimationElement($animations, $selector_css) {
    foreach ($animations as $selector => $animation) {
      if (count($animation) && $animation['enable']) {
        $selector_arr = explode('.', $selector);
        $part = $selector_arr[0];
        $screen = $selector_arr[1];
        $css_content = '';

        foreach ($animation['style'] as $key => $value) {
          $css_content .= "$key: $value;";
        }

        $part_settings = (isset($data['settings']) && isset($data['settings'][$part])) ? $data['settings'][$part] : array();
        $default_selector = ".{$this->wrap_class} .{$selector_css}";
        $selector_css = $this->getSelectorCss($part_settings, $part, $default_selector);
        $joinSelector = implode(', ', $selector_css);

        if (trim($css_content)) {
          switch ($screen) {
            case 'lg':
              $this->css['lg'][] = $joinSelector . '{' . $css_content . '}';
              break;
            case 'md':
              $this->css['md'][] = $joinSelector . '{' . $css_content . '}';
              break;

            case 'sm':
              $this->css['sm'][] = $joinSelector . '{' . $css_content . '}';
              break;

            case 'xs':
              $this->css['xs'][] = $joinSelector . '{' . $css_content . '}';
              break;
            default :
              $this->css['normal'][] = $joinSelector . '{' . $css_content . '}';
          }
        }
      }
    }
  }

  /**
   *  Get full style of awebuilder
   */
  public function getCSS() {
    $css_data = '';

    foreach ($this->css as $screen => $css) {
      switch ($screen) {
        case 'lg':
          array_unshift($css, '@media(max-width:1199px){');
          array_push($css, '}');
          break;
        case 'md':
          array_unshift($css, '@media(max-width:991px){');
          array_push($css, '}');
          break;

        case 'sm':
          array_unshift($css, '@media(max-width:767px){');
          array_push($css, '}');
          break;

        case 'xs':
          array_unshift($css, '@media(max-width:575px){');
          array_push($css, '}');
      }

      $css_data .= implode("", $css);
    }

    return $css_data;
  }


  /**
   * @param $type
   * @param $file_name
   * @return string
   */
  public function saveFileCss($type, $file_name) {
    $css = $this->getCSS();
    $destination_dir = "public://awe-{$type}-css";
    file_prepare_directory($destination_dir, FILE_CREATE_DIRECTORY);
    $file_name = file_unmanaged_save_data($css, $destination_dir . "/{$file_name}.css", FILE_EXISTS_REPLACE);
    $file_url = '/' . PublicStream::basePath(). '/' . file_uri_target($file_name);
    return $file_url;
  }

}