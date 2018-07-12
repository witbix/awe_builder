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
 *   id = "slideshow",
 *   title = @Translation("Slideshow"),
 *   name = "el-slideshow",
 *   theme = "el_slideshow",
 * )
 */

class SlideshowAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'slideshow',
      'title' => t('Slideshow'),
      'name' => 'el-slideshow',
      'theme' => 'el_slideshow',
      'jsFile' => 'assets/js/plugins/slideshow/el-slideshow.js',
      'jsTemplate' => 'assets/js/plugins/slideshow/el-slideshow.tpl.js',
      'libraries'=>array(
        '$.fn.owlCarousel'=>array(
          'version'=> '1.0.2',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/slideshow/assets/owl.carousel.css'=>array('type'=>'css'),
            'assets/js/plugins/slideshow/assets/animate.css'=>array('type'=>'css'),
            'assets/js/plugins/slideshow/assets/owl.theme.default.css'=>array('type'=>'css'),
            'assets/js/plugins/slideshow/assets/el-slideshow.css'=>array('type'=>'css'),
            'assets/js/plugins/slideshow/assets/owl.carousel.min.js'=>array('type'=>'js'),
            'assets/js/plugins/slideshow/assets/slideshow-frontend.js'=>array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}