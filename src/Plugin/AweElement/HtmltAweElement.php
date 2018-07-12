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
 *   id = "html",
 *   title = @Translation("HTML"),
 *   name = "el-html",
 *   theme = "el_html",
 * )
 */

class HtmltAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'html',
      'title' => t('HTML'),
      'name' => 'el-html',
      'theme' => 'el_html',
      'jsFile' => 'assets/js/plugins/html/el-html.js',
      'jsTemplate' => 'assets/js/plugins/html/el-html.tpl.js'
    ];

    return $libraries;
  }
}