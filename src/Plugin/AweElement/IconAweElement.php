<?php
/**
 * @file
 * Contains \Drupal\awe_builder\Plugin\AweElement\AlertAweElement.
 */
namespace Drupal\awe_builder\Plugin\AweElement;

use Drupal\awe_builder\AweElementBase;

/**
 * Provides a 'text' AweElement.
 *
 * @AweElement(
 *   id = "icon",
 *   title = @Translation("Icon"),
 *   name = "el-icon",
 *   theme = "el_icon",
 * )
 */

class IconAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'icon',
      'title' => t('Icon'),
      'name' => 'el-icon',
      'theme' => 'el_icon',
      'jsFile' => 'assets/js/plugins/icon/el-icon.js',
      'jsTemplate' => 'assets/js/plugins/icon/el-icon.tpl.js',
      'libraries' => array(
        'iconStyle'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/icon/el-icon.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}