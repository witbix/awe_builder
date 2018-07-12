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
 *   id = "bar_counter",
 *   title = @Translation("Bar Counter"),
 *   name = "el-bar-counter",
 *   theme = "el_bar_counter",
 * )
 */


class BarCounterAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'bar_counter',
      'title' => t('Bar Counter'),
      'name' => 'el-bar-counter',
      'theme' => 'el_bar_counter',
      'jsFile' => 'assets/js/plugins/bar-counter/el-bar-counter.js',
      'jsTemplate' => 'assets/js/plugins/bar-counter/el-bar-counter.tpl.js',
      'libraries'=>array(
        '$.fn.progressbar'=>array(
          'version'=> '0.9.0',
          'destination'=>array('frontend'),
          'files'=>array(
             'assets/js/plugins/bar-counter/assets/bootstrap-progressbar.min.js'=>array('type'=>'js'),
             'assets/js/plugins/bar-counter/assets/el-bar-counter.css'=>array('type'=>'css'),
             'assets/js/plugins/bar-counter/assets/front-counter.js'=>array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}
