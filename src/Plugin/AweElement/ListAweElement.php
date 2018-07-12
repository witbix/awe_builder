<?php
/**
 * @file
 * Contains \Drupal\awe_page\Plugin\AweElement\ListAweElement.
 */
namespace Drupal\awe_builder\Plugin\AweElement;

use Drupal\awe_builder\AweElementBase;

/**
 * Provides a 'text' AweElement.
 *
 * @AweElement(
 *   id = "list",
 *   title = @Translation("List"),
 *   name = "el-list",
 *   theme = "el_list",
 * )
 */

class ListAweElement extends AweElementBase {

  public function defineLibraries() {

    $libraries = [
      'id'=>'list',
      'title' => t('List'),
      'name' => 'el-list',
      'theme' => 'el_list',
      'jsFile' => 'assets/js/plugins/list/el-list.js',
      'jsTemplate' => 'assets/js/plugins/list/el-list.tpl.js',
    ];

    return $libraries;
  }

}
