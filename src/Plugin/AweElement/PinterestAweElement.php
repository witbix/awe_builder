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
 *   id = "pinterest",
 *   title = @Translation("Pinterest"),
 *   name = "el-pinterest",
 *   theme = "el_pinterest",
 * )
 */

class PinterestAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'pinterest',
      'title' => t('Pinterest'),
      'name' => 'el-pinterest',
      'theme' => 'el_pinterest',
      'jsFile' => 'assets/js/plugins/pinterest/el-pinterest.js',
      'jsTemplate' => 'assets/js/plugins/pinterest/el-pinterest.tpl.js',
      'libraries'=>array(
        'pinterestStyle'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/pinterest/el-pinterest.css'=>array('type'=>'css')
          )
        ),
        'jsClass.PinUtils'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'https://assets.pinterest.com/js/pinit.js'=>array('type'=>'js','async'=> true, 'defer'=> true,'external'=> true)
          )
        )
      )
    ];

    return $libraries;
  }
}