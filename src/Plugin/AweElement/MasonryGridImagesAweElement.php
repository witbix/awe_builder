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
 *   id = "masonry-grid-images",
 *   title = @Translation("Masonry grid images"),
 *   name = "el-masonry-grid-images",
 *   theme = "el_masonry_grid_images",
 * )
 */

class MasonryGridImagesAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'masonry-grid-images',
      'title' => t('Masonry grid images'),
      'name' => 'el-masonry-grid-images',
      'theme' => 'el_masonry_grid_images',
      'jsFile' => 'assets/js/plugins/masonry-grid-images/el-masonry-grid-images.js',
      'jsTemplate' => 'assets/js/plugins/masonry-grid-images/el-masonry-grid-images.tpl.js',
      'libraries'=>array(
        '$.fn.magnificPopup'=>array(
          'version'=> '1.1.0',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/masonry-grid-images/assets/jquery.magnific-popup.min.js'=>array('type'=>'js'),
            'assets/js/plugins/masonry-grid-images/assets/magnific-popup.css'=>array('type'=>'css')
          )
        ),
        '$.fn.imagesLoaded'=>array(
          'version'=> '3.0.2',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/masonry-grid-images/assets/imagesloaded.pkgd.js'=>array('type'=>'js')
          )
        ),
        '$.fn.masonry'=>array(
          'version'=> '3.1.5',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/masonry-grid-images/assets/masonry.pkgd.min.js'=>array('type'=>'js')
          )
        ),
        'masonryImages'=>array(
          'version'=> '1.0',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/masonry-grid-images/assets/masonry-grid-images-frontend.js'=> array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}