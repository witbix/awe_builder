<?php

/**
 * @file
 * Contains \Drupal\awe_page\Access\AwePageAccessCheck.
 */
namespace Drupal\awe_builder\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Routing\Access\AccessInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountInterface;

class AweBuilderAccessCheck implements AccessInterface {

  public function access(AccountInterface $account, RouteMatchInterface $route_match) {
    $route_name = $route_match->getRouteName();
    $type = $route_match->getParameter('type');

    switch ($route_name) {
      case 'awe_builder.admin.template':
        if ($type == 'page' && $account->hasPermission('add page template')) {
          return AccessResult::allowed();
        }
        if ($type == 'section' && $account->hasPermission('add section template')) {
          return AccessResult::allowed();
        }

        return AccessResult::neutral();

        break;

      default:
        return AccessResult::neutral();
    }





  }
}