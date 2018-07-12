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
 *   id = "round-counter",
 *   title = @Translation("Round Counter"),
 *   name = "el-round-counter",
 *   theme = "el_round_counter",
 * )
 */

class RoundCounterAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'round-counter',
      'title' => t('Round Counter'),
      'name' => 'el-round-counter',
      'theme' => 'el_round_counter',
      'jsFile' => 'assets/js/plugins/round-counter/el-round-counter.js',
      'jsTemplate' => 'assets/js/plugins/round-counter/el-round-counter.tpl.js',
      'libraries'=>array(
        'jsClass.ProgressBar'=>array(
          'version'=> '1.0.2',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/round-counter/assets/progressbar.min.js'=>array('type'=>'js')
          )
        ),
        '$.fn.mdProgressRound'=>array(
          'version'=> '1.0.2',
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/round-counter/assets/jquery.mdProgressRound.js'=>array('type'=>'js')
          )
        ),
        'elProgressRound'=>array(
          'destination'=>array('frontend'),
          'files'=>array(
            'assets/js/plugins/round-counter/assets/el-round-counter.css'=>array('type'=>'css')
          )
        )
      )
    ];

    return $libraries;
  }
}