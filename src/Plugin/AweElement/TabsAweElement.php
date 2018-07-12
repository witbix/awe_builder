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
 *   id = "tabs",
 *   title = @Translation("Tabs"),
 *   name = "el_tabs",
 *   theme = "el_tabs",
 * )
 */


class TabsAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'tabs',
      'title' => t('Tabs'),
      'name' => 'el_tabs',
      'theme' => 'el_tabs',
      'jsFile' => 'assets/js/plugins/tabs/el-tabs.js',
      'jsTemplate' => 'assets/js/plugins/tabs/el-tabs.tpl.js',
      'libraries'=>array(
        '$.fn.aweTabs'=>array(
          'version'=> '1.0',
          'destination'=>array('frontend'),
          'files'=>array(
             'assets/js/plugins/tabs/jquery.awe-tabs.js'=>array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}
