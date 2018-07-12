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
 *   id = "image",
 *   title = @Translation("Image"),
 *   name = "el-image",
 *   theme = "el_image",
 * )
 */

class ImageAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'image',
      'title' => t('Image'),
      'name' => 'el-image',
      'theme' => 'el_image',
      'jsFile' => 'assets/js/plugins/image/el-image.js',
      'jsTemplate' => 'assets/js/plugins/image/el-image.tpl.js',
      'libraries'=>array(        
        '$.fn.magnificPopup'=>array(
          'version'=> '1.1.0',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/image/assets/jquery.magnific-popup.min.js'=>array('type'=>'js'),
            'assets/js/plugins/image/assets/magnific-popup.css'=>array('type'=>'css')
          )
        ),
        '$.fn.aweImage'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/image/assets/el-image.css'=>array('type'=>'css'),
            'assets/js/plugins/image/assets/image-frontend.js'=>array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}