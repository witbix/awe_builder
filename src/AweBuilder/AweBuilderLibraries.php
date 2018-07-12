<?php

/**
 * Define libraries from data of awebuilder
 * @file
 * Contains \Drupal\awe_builder\AweBuilderRender.
 */
namespace Drupal\awe_builder\AweBuilder;

class AweBuilderLibraries {

  /**
   * @var array $data of awebuilder
   */
  protected $data;

  /**
   * @var array elements of data
   */
  protected $elements;

  /**
   * @var array libraries from data of awebuilder
   */
  protected $libraries;


  /**
   * AweBuilderLibraries constructor.
   * @param $data
   */
  public function __construct($data) {
    $this->setElements($data);
    $this->setLibraries();
  }


  protected function setElements($data) {
    if(isset($data['machineName'])){
      // fix fo megamenu
      $data = [$data];
    }
    
    foreach ($data as $index => $item) {
      if (isset($item['machineName']) && !empty($item['machineName'])) {
        $element = $item['machineName'];
        if (!in_array($element, [
          'section',
          'column',
          'el_accordion_item',
          'el_tab_item'
        ])
        ) {
          $this->elements[] = $element;
        }
      }

      if (isset($item['content']) && !empty($item['content'])) {
        $this->setElements($item['content']);
      }
    }
    if (is_array($this->elements)) {
      $this->elements = array_unique($this->elements);
    }
  }

  /**
   * Set libraries of element
   */
  protected function setLibraries() {
    $elements = $this->elements;
    if (is_array($elements)) {
      $managerElement = \Drupal::service('plugin.manager.awe_element');
      $this->libraries = $managerElement->getLibrariesElements($elements);
    }
  }

  /**
   * @return array libraries of data from awebuilder
   */
  public function getLibraries() {
    return $this->libraries;
  }

}