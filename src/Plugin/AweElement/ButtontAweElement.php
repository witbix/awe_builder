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
 *   id = "button",
 *   title = @Translation("Button"),
 *   name = "el-button",
 *   theme = "el_button",
 * )
 */

class ButtontAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'button',
      'title' => t('Button'),
      'name' => 'el-button',
      'theme' => 'el_button',
      'jsFile' => 'assets/js/plugins/button/el-button.js',
      'jsTemplate' => 'assets/js/plugins/button/el-button.tpl.js',
      'libraries'=>array(
        'buttonStyle'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/button/el-button.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}