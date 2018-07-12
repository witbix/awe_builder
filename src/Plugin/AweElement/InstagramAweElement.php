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
 *   id = "instagram",
 *   title = @Translation("Instagram"),
 *   name = "el-instagram",
 *   theme = "el_instagram",
 * )
 */

class InstagramAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'instagram',
      'title' => t(''),
      'name' => 'el-instagram',
      'theme' => 'el_instagram',
      'jsFile' => 'assets/js/plugins/instagram/el-instagram.js',
      'jsTemplate' => 'assets/js/plugins/instagram/el-instagram.tpl.js',
      'libraries'=>array(
        'jsClass.Instafeed'=>array(
          'version'=> '1.3.3',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/instagram/assets/el-instagram.css'=>array('type'=>'css'),
            'assets/js/plugins/instagram/assets/instafeed.min.js'=>array('type'=>'js'),
            'assets/js/plugins/instagram/assets/instagram-frontend.js'=>array('type'=>'js')
          )
        ),
        '$.fn.magnificPopup'=>array(
          'version'=> '1.1.0',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/instagram/assets/jquery.magnific-popup.min.js'=>array('type'=>'js'),
            'assets/js/plugins/instagram/assets/magnific-popup.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}