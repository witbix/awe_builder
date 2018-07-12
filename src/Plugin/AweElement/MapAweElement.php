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
 *   id = "map",
 *   title = @Translation("Google Map"),
 *   name = "el_map",
 *   theme = "el_map",
 * )
 */

class MapAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'map',
      'title' => t('Google Map'),
      'name' => 'el_map',
      'theme' => 'el_map',
      'jsFile' => 'assets/js/plugins/map/el-map.js',
      'jsTemplate' => 'assets/js/plugins/map/el-map.tpl.js',
      'libraries'=>array(
        'jsClass.google'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'https://maps.googleapis.com/maps/api/js?key=AIzaSyCiVV6Y6eoCmqPhimYk3jCWG-a0xkenbU8'=>array('type'=>'js','external'=> true)
          )
        ),
        '$.fn.aweMap'=>array(
          'version'=> '1.0',
          'destination'=> array('frontend'),
          'files'=>array(
            'assets/js/plugins/map/jquery.awe-map.js'=>array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}