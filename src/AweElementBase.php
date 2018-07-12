<?php

/**
 * @file
 * Provides Drupal\awe_builder\AweElementBase.
 */
namespace Drupal\awe_builder;

use Drupal\Component\Plugin\PluginBase;

class AweElementBase extends PluginBase implements AweElementInterface {

  /**
   * Return the title of AweElement
   */
  public function getTitle() {
    return $this->pluginDefinition['title'];
  }

  /**
   * Return the name of AweElement.
   *
   * @return string
   */
  public function getName() {
    return $this->pluginDefinition['name'];
  }


  /**
   * Return function theme name AweElement use
   * @return mixed
   */
  public function getThemeName() {
    return $this->pluginDefinition['theme'];
  }


  /**
   * Define Libraries for awe element need dependencies. And use it in function getLibraries()
   * @return array Libraries
   */
  public function defineLibraries() {
    $libraries = [];
    return $libraries;
  }
}