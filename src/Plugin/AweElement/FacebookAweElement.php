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
 *   id = "facebook",
 *   title = @Translation("Facebook"),
 *   name = "el-facebook",
 *   theme = "el_facebook",
 * )
 */

class FacebookAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'facebook',
      'title' => t(''),
      'name' => 'el-facebook',
      'theme' => 'el_facebook',
      'jsFile' => 'assets/js/plugins/facebook/el-facebook.js',
      'jsTemplate' => 'assets/js/plugins/facebook/el-facebook.tpl.js',
      'libraries'=>array(
        'facebookStyle'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/facebook/el-facebook.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}