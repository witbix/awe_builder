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
 *   id = "masonry-grid",
 *   title = @Translation("Masonry grid"),
 *   name = "el_masonry_grid",
 *   theme = "el_masonry_grid",
 * )
 */

class MasonryGridAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'masonry-grid',
      'title' => t('Masonry grid'),
      'name' => 'el_masonry_grid',
      'theme' => 'el_masonry_grid',
      'jsFile' => 'assets/js/plugins/masonry-grid/el-masonry-grid.js',
      'jsTemplate' => 'assets/js/plugins/masonry-grid/el-masonry-grid.tpl.js',
      'libraries'=>array(
        '$.fn.masonry'=>array(
          'version'=> '3.1.5',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/masonry-grid/assets/masonry.pkgd.min.js'=>array('type'=>'js')
          )
        ),
        'masonryGrid'=>array(
          'version'=> '1.0',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/masonry-grid/assets/masonry-fix-building.css'=> array('type'=>'css'),
            'assets/js/plugins/masonry-grid/assets/masonry-grid-frontend.js'=> array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}