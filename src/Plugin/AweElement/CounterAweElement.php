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
 *   id = "counter",
 *   title = @Translation("Counter"),
 *   name = "el-counter",
 *   theme = "el_counter",
 * )
 */

class CounterAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'counter',
      'title' => t('Counter'),
      'name' => 'el-counter',
      'theme' => 'el_counter',
      'jsFile' => 'assets/js/plugins/counter/el-counter.js',
      'jsTemplate' => 'assets/js/plugins/counter/el-counter.tpl.js',
      'libraries'=>array(
        '$.fn.countTo'=>array(
          'version'=>'1.0.2',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/counter/assets/jquery.countTo.js'=>array('type'=>'js')
          )
        ),
        '$.fn.mdCounter'=>array(
          'version'=>'1.0.2',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/counter/assets/jquery.mdCounter.js'=>array('type'=>'js')
          )
        ),
        'elCounter'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/counter/assets/el-counter.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}