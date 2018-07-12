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
 *   id = "nested",
 *   title = @Translation("Nested"),
 *   name = "el_nested",
 *   theme = "el_nested",
 * )
 */


class NestedAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'nested',
      'title' => t('Nested'),
      'name' => 'el_nested',
      'theme' => 'el_nested',
      'jsFile' => 'assets/js/plugins/nested/el-nested.js',
      'libraries'=>array()
    ];

    return $libraries;
  }
}
