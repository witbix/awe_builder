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
 *   id = "justified-grid",
 *   title = @Translation("Justified grid"),
 *   name = "el-justified-grid",
 *   theme = "el_justified_grid",
 * )
 */

class JustifiedGridAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'justified-grid',
      'title' => t('Justified grid'),
      'name' => 'el-justified-grid',
      'theme' => 'el_justified_grid',
      'jsFile' => 'assets/js/plugins/justified-grid/el-justified-grid.js',
      'jsTemplate' => 'assets/js/plugins/justified-grid/el-justified-grid.tpl.js',
      'libraries'=>array(
        '$.fn.magnificPopup'=>array(
          'version'=> '1.1.0',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/justified-grid/assets/jquery.magnific-popup.min.js'=>array('type'=>'js'),
            'assets/js/plugins/justified-grid/assets/magnific-popup.css'=>array('type'=>'css')
          )
        ),
        '$.fn.imagesLoaded'=>array(
          'version'=> '3.0.2',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/justified-grid/assets/imagesloaded.pkgd.js'=>array('type'=>'js')
          )
        ),
        '$.fn.justifiedGallery'=>array(
          'version'=> '3.5.1',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/justified-grid/assets/jquery.justifiedGallery.min.js'=>array('type'=>'js')
          )
        ),
        '$.fn.aweJustifiedGrid'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/justified-grid/assets/justifiedGallery.min.css'=>array('type'=>'css'),
            'assets/js/plugins/justified-grid/assets/el-justified-grid.css'=>array('type'=>'css'),
            'assets/js/plugins/justified-grid/assets/justified-grid-frontend.js'=>array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}