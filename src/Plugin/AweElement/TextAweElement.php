<?php
/**
 * @file
 * Contains \Drupal\awe_builder\Plugin\AweElement\TextAweElement.
 */
namespace Drupal\awe_builder\Plugin\AweElement;

use Drupal\awe_builder\AweElementBase;

/**
 * Provides a 'text' AweElement.
 *
 * @AweElement(
 *   id = "text",
 *   title = @Translation("Text"),
 *   name = "el-text",
 *   theme = "el_text",
 * )
 */

class TextAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'text',
      'title' => t('Text'),
      'name' => 'el-text',
      'theme' => 'el_text',
      'jsFile' => 'assets/js/plugins/text/el-text.js',
      'jsTemplate' => 'assets/js/plugins/text/el-text.tpl.js'
    ];

    return $libraries;
  }
}