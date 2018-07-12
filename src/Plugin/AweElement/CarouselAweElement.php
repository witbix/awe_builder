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
 *   id = "carousel",
 *   title = @Translation("Carousel"),
 *   name = "el_carousel",
 *   theme = "el_carousel",
 * )
 */


class CarouselAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'carousel',
      'title' => t('Carousel'),
      'name' => 'el_carousel',
      'theme' => 'el_carousel',
      'jsFile' => 'assets/js/plugins/carousel/el-carousel.js',
      'jsTemplate' => 'assets/js/plugins/carousel/el-carousel.tpl.js',
      'libraries'=>array(
        '$.fn.owlCarousel'=>array(
          'version'=> '2.1.6',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/carousel/assets/owl.carousel.css'=> array('type' => 'css'),
            'assets/js/plugins/carousel/assets/animate.css'=>  array('type' => 'css'),
            'assets/js/plugins/carousel/assets/owl.theme.default.css'=>  array('type' => 'css'),
            'assets/js/plugins/carousel/assets/owl.carousel.min.js'=>  array('type' => 'js')
          )
        ),
        '$.fn.aweCarousel'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/carousel/assets/el-carousel.css'=> array('type' => 'css'),
            'assets/js/plugins/carousel/assets/carousel-frontend.js'=>  array('type' => 'js')
          )
        )
      )
    ];

    return $libraries;
  }
}
