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
 *   id = "call_to_action",
 *   title = @Translation("Call to action"),
 *   name = "el-call-to-action",
 *   theme = "el_call_action",
 * )
 */

class CallActionAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'call_to_action',
      'title' => t('Call to action'),
      'name' => 'el-call-to-action',
      'theme' => 'el_call_action',
      'jsFile' => 'assets/js/plugins/call-to-action/el-call-to-action.js',
      'jsTemplate' => 'assets/js/plugins/call-to-action/el-call-to-action.tpl.js',
      'libraries'=>array(
        'elCallToAction'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/call-to-action/el-call-to-action.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}