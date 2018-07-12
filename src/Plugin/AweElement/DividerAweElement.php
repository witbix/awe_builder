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
 *   id = "divider",
 *   title = @Translation("Divider"),
 *   name = "el-divider",
 *   theme = "el_divider",
 * )
 */

class DividerAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'divider',
      'title' => t('Divider'),
      'name' => 'el-divider',
      'theme' => 'el_divider',
      'jsFile' => 'assets/js/plugins/divider/el-divider.js',
      'jsTemplate' => 'assets/js/plugins/divider/el-divider.tpl.js',
      // 'libraries'=>array(
      //   'dividerStyle'=>array(
      //     'destination'=>array('frontend'),
      //     'files'=>array(
      //       'assets/js/plugins/divider/el-divider.css'=>array('type'=>'css')
      //     )
      //   )
      // )
    ];

    return $libraries;
  }
}