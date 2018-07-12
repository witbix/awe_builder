<?php
/**
 * @file
 * Contains \Drupal\awe_page\Plugin\AweElement\HeaderAweElement.
 */
namespace Drupal\awe_builder\Plugin\AweElement;

use Drupal\awe_builder\AweElementBase;

/**
 * Provides a 'text' AweElement.
 *
 * @AweElement(
 *   id = "header",
 *   title = @Translation("Header"),
 *   name = "el-header",
 *   theme = "el_header",
 * )
 */

class HeaderAweElement extends AweElementBase {

  public function defineLibraries() {

    $libraries = [
      'id'=>'header',
      'title' => t('Header'),
      'name' => 'el-header',
      'theme' => 'el_header',
      'jsFile' => 'assets/js/plugins/header/el-header.js',
      'jsTemplate' => 'assets/js/plugins/header/el-header.tpl.js',
    ];

    return $libraries;
  }

}
