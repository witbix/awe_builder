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
 *   id = "googleplus",
 *   title = @Translation("Google Plus"),
 *   name = "el-googleplus",
 *   theme = "el_google_plus",
 * )
 */

class GooglePlustAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'googleplus',
      'title' => t('Google Plus'),
      'name' => 'el-googleplus',
      'theme' => 'el_google_plus',
      'jsFile' => 'assets/js/plugins/googleplus/el-googleplus.js',
      'jsTemplate' => 'assets/js/plugins/googleplus/el-googleplus.tpl.js',
      'libraries'=>array(
        'googlePlusStyle'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
           'assets/js/plugins/googleplus/el-googleplus.css'=>array('type'=>'css')
          )
        ),
        'jsClass.gapi'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
          'https://apis.google.com/js/platform.js'=>array('type'=>'js','async'=> true, 'defer'=> true,'external'=> true)
          )
        )
      )
    ];

    return $libraries;
  }
}