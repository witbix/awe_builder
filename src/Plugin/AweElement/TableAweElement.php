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
 *   id = "table",
 *   title = @Translation("Table"),
 *   name = "el-table",
 *   theme = "el_table",
 * )
 */

class TableAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'table',
      'title' => t('Table'),
      'name' => 'el-table',
      'theme' => 'el_table',
      'jsFile' => 'assets/js/plugins/table/el-table.js',
      'jsTemplate' => 'assets/js/plugins/table/el-table.tpl.js'
    ];

    return $libraries;
  }
}