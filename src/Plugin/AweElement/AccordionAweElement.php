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
 *   id = "accordion",
 *   title = @Translation("Accordion"),
 *   name = "el_accordion",
 *   theme = "el_accordion",
 * )
 */


class AccordionAweElement extends AweElementBase {

  /**
   * {@inheritdoc}
   */
  public function defineLibraries() {
    $libraries = [
      'id'=>'accordion',
      'title' => t('Accordion'),
      'name' => 'el_accordion',
      'theme' => 'el_accordion',
      'jsFile' => 'assets/js/plugins/accordion/el_accordion.js',
      'jsTemplate' => 'assets/js/plugins/accordion/el_accordion.tpl.js',
      'libraries'=>array(
        '$.fn.aweAccordion'=>array(
          'version'=> '1.0',
          'destination'=>array('frontend'),
          'files'=>array(
             'assets/js/plugins/accordion/jquery.awe-accordion.js'=>array('type'=>'js')
          )
        )
      )
    ];

    return $libraries;
  }
}
