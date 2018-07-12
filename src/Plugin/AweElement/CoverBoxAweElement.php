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
 *   id = "coverbox",
 *   title = @Translation("CoverBox"),
 *   name = "el-coverbox",
 *   theme = "el_coverbox",
 * )
 */

class CoverBoxAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'coverbox',
      'title' => t('CoverBox'),
      'name' => 'el-coverbox',
      'theme' => 'el_coverbox',
      'jsFile' => 'assets/js/plugins/coverbox/el-coverbox.js',
      'jsTemplate' => 'assets/js/plugins/coverbox/el-coverbox.tpl.js',
      'libraries'=>array(
        'elCoverbox'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/coverbox/assets/el-coverbox.css'=>array('type'=>'css'),
            'assets/js/plugins/coverbox/assets/front-coverbox.js'=>array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}