<?php

/**
 * @file
 * Provides Drupal\awe_builder\AweElementInterface.
 */
namespace Drupal\awe_builder;

/**
 * AweElement Interface.
 */
interface AweElementInterface {

  /**
   * Return the name of AweElement.
   *
   * @return string
   */
  public function getName();

  /**
   * Return the title of AweElement
   */
  public function getTitle();

  /**
   * Return function theme name AweElement use
   * @return mixed
   */
  public function getThemeName();

  /**
   * Define Libraries for awe element need dependencies. And use it in function getLibraries()
   * @return array Libraries
   */
  public function defineLibraries();
}
