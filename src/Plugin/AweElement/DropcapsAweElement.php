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
 *   id = "dropcaps",
 *   title = @Translation("Dropcaps"),
 *   name = "el-dropcaps",
 *   theme = "el_dropcaps",
 * )
 */

class DropcapsAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'dropcaps',
      'title' => t('Dropcaps'),
      'name' => 'el-dropcaps',
      'theme' => 'el_dropcaps',
      'jsFile' => 'assets/js/plugins/dropcaps/el-dropcaps.js',
      'jsTemplate' => 'assets/js/plugins/dropcaps/el-dropcaps.tpl.js',
      'libraries'=>array(
        'elDropcaps'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/dropcaps/el-dropcaps.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}