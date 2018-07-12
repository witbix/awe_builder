<?php

/**
 * @file
 * Contains \Drupal\awe_builder\AweBuilderRender.
 */
namespace Drupal\awe_builder\AweBuilder;

use Drupal\Component\Serialization\Json;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

class AweBuilderRender implements ContainerInjectionInterface {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    // TODO: Implement create() method.
  }


  /**
   * @param $data
   * @param $wrap_class
   * @param $elements
   * @return mixed
   */
  public static function processData($data, $elements) {
    $content = [];    
    if(isset($data['machineName'])){
      // fix fo megamenu
      $data = [$data];
    }
    
    foreach ($data as $index => $item) {
      $inner_class = $item['machineName'].'-'.$item['cid'];
      $content[$index]['#theme'] = $elements[$item['machineName']];
      $item['settings'] = $settings = Json::decode($item['settings']);
      $customStyle = Json::decode($item['customStyles']);
      $content[$index]['#el_settings'] = $settings;

      if (isset($item['title'])) {
        $content[$index]['#el_title'] = $item['title'];
      }
      
      // for menu item
      if($item['machineName'] === 'menu'){
        if (isset($item['level'])) {
          $content[$index]['#level'] = $item['level'];
        }
        if (isset($item['url'])) {
          $content[$index]['#url'] = $item['url'];
        }
        if (isset($item['in_active_trail'])) {
          $content[$index]['#in_active_trail'] = $item['in_active_trail'];
        }
      }

      if (in_array($item['machineName'], ['section', 'column'])) {
        $content[$index]['#custom_id'] = $customStyle['id'];
        $content[$index]['#custom_classes'] = $customStyle['classes'];
      }

      if (isset($item['content']) && !empty($item['content'])) {
        $content[$index]['#el_content'] = self::processData($item['content'], $elements);
      }

      if (isset($item['extraData']) && !empty($item['extraData'])) {
        $content[$index]['#el_extra_data'] = $item['extraData'];
      }

      if (isset($item['renderedAnimation']) && !empty($item['renderedAnimation'])) {
        $animations = $item['renderedAnimation'];

        foreach ($animations as $part => $animation) {
          $name = explode('.', $part);
          if ($name[0] == 'main') {
            $animations[$part]['selector'] = '';
          }
          else {
            $animations[$part]['selector'] = $settings[$name[0]]['selector'];
          }
        }
        $content[$index]['#el_animation'] = Json::encode($animations);
      }
      $overlay = self::getOverlay($item);
      if(!empty($overlay)){
        $content[$index]['#overlay'] = $overlay;
      }
      
      if (!in_array($item['machineName'], ['section', 'column', 'menubox', 'menu'])) {
        $container_class = $inner_class . ' ac_element' . ($customStyle['classes'] ? " {$customStyle['classes']}" : '');
        $content[$index]['#theme_wrappers'] = [
          'container' => [
            '#attributes' => [
              'id' => $customStyle['id'],
              'class' => $container_class,
            ]
          ]
        ];
      }

      if (isset($animations)) {
        $content[$index]['#theme_wrappers']['container']['#attributes']['data-animation'] = Json::encode($animations);
        unset($animations);
      }
      if(!empty($overlay)){
        $content[$index]['#theme_wrappers']['container']['#attributes']['data-overlay'] = $overlay;
      }

      $content[$index]['#el_wrap_class'] = $inner_class;
    }
    return $content;
  }
  
  private static function getOverlay($item){
    $settings = $item['settings'];
    $overlay = array();
    foreach ($settings as $part => $data) {
      if (isset($data['style']) && count($data['style'])) {
        foreach ($data['style'] as $state => $styles) {
          if (isset($styles['background']) && isset($styles['background']['overlay'])) {
            foreach ($styles['background']['overlay'] as $mode => $val) {
              if (isset($styles['background']['enable']) && isset($styles['background']['enable'][$mode]) && $styles['background']['enable'][$mode])
                $overlay["{$part}.{$state}.{$mode}"] = array(
                  'value' => $val,
                  'selector' => isset($settings[$part]['selector']) ? $settings[$part]['selector'] : '',
                );
            }
          }
        }
      }
    }
    if(!empty($overlay))
      return Json::encode($overlay);
  }


  /**
   * @param $attributes
   * @param $data
   * @return mixed
   */
  public static function getAttributes(&$attributes, $data) {
    foreach ($data as $attr) {
      $attributes[$attr['name']] = $attr['value'];
    }
    return $attributes;
  }

  /**
   * @param $data
   * @return array
   */
  public static function getElementPage($data) {
    $items = [];

    foreach ($data as $index => $value) {
      $items[] = $value['machineName'];
      if (isset($value['content']) && !empty($value['content'])) {
        static::getElementPage($value['content']);
      }
    }


    return $items;
  }


  /**
   * @param $str_style
   * @return array
   */
  public static function getFontStyle($str_style) {
    $output = array();

    if ($str_style) {
      $styles = explode(',', $str_style);
      foreach ($styles as $style) {
        switch (intval($style)) {
          case 100:
          $name = 'Thin';
          break;
        case 200:
          $name = "Extra-Light";
          break;
        case 300:
          $name = 'Light';
          break;
        case 400:
          $name = "Normal";
          break;
        case 500:
          $name = "Medium";
          break;
        case 600:
          $name = "Semi-Bold";
          break;
        case 700:
          $name = "Bold";
        case 800:
          $name = "Extra-Bold";
          break;
        case 900:
          $name = "Ultra-Bold";
          break;

        default:
          $name = FALSE;
          break;
      }

        if ($name) {
          if (strpos($style, 'italic') !== FALSE || strpos($style, 'i') !== FALSE) {
            $name = $name . " Italic";
          }

          $output[$style] = $name;
        }
      }
    }

    return $output;
  }

  public static function getAweUrlConfig() {
    return [
      'fileUpload' => Url::fromRoute('awe_builder.admin.media_upload', [], ['absolute' => TRUE])
        ->toString(),
      'icon' => Url::fromRoute('awe_builder.admin.icons', [], ['absolute' => TRUE])
        ->toString(),
      'library' => Url::fromRoute('awe_builder.admin.media_library', [], ['absolute' => TRUE])
        ->toString(),
      'fonts' => Url::fromRoute('awe_builder.admin.fonts', [], ['absolute' => TRUE])
        ->toString(),
      'element' => Url::fromRoute('awe_builder.admin.json_response', [], ['absolute' => TRUE])
        ->toString(),
      'templates' => Url::fromRoute('awe_builder.admin.template.items', [], ['absolute' => TRUE])
        ->toString(),
      'buildPage' => '',
      'save' => ''
    ];
  }
}
