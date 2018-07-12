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
 *   id = "alert",
 *   title = @Translation("Alert"),
 *   name = "el-alert",
 *   theme = "el_alert",
 * )
 */


class AlertAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'alert',
      'title' => t('Alert'),
      'name' => 'el-alert',
      'theme' => 'el_alert',
      'jsFile' => 'assets/js/plugins/alert/el-alert.js',
      'jsTemplate' => 'assets/js/plugins/alert/el-alert.tpl.js',
      'libraries'=>array(
        '$.fn.aweAlert'=>array(
          'version'=> '1.0',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/alert/alert-frontend.js'=>array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}