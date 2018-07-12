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
 *   id = "flickr",
 *   title = @Translation("Flickr"),
 *   name = "el-flickr",
 *   theme = "el_flickr",
 * )
 */

class FlickrAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'flickr',
      'title' => t('Flickr'),
      'name' => 'el-flickr',
      'theme' => 'el_flickr',
      'jsFile' => 'assets/js/plugins/flickr/el-flickr.js',
      'jsTemplate' => 'assets/js/plugins/flickr/el-flickr.tpl.js',
      'libraries'=>array(        
        '$.fn.magnificPopup'=>array(
          'version'=> '1.1.0',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/flickr/assets/jquery.magnific-popup.min.js'=>array('type'=>'js'),
            'assets/js/plugins/flickr/assets/magnific-popup.css'=>array('type'=>'css')
          )
        ),
        '$.fn.jflickrfeed'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/flickr/assets/jflickrfeed.js'=>array('type'=>'js')
          )
        ),
        '$.fn.aweFlickr'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
           'assets/js/plugins/flickr/assets/el-flickr.css'=>array('type'=>'css'),
           'assets/js/plugins/flickr/assets/flickr-frontend.js'=>array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}