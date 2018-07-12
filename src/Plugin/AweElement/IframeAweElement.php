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
 *   id = "iframe",
 *   title = @Translation("Iframe"),
 *   name = "el-iframe",
 *   theme = "el_iframe",
 * )
 */

class IframeAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'iframe',
      'title' => t('Iframe'),
      'name' => 'el-iframe',
      'theme' => 'el_iframe',
      'jsFile' => 'assets/js/plugins/iframe/el-iframe.js',
      'jsTemplate' => 'assets/js/plugins/iframe/el-iframe.tpl.js',
      'libraries'=>array(
        'iframeStyle'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/iframe/el-iframe.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}