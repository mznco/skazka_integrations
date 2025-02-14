(function () {

  angular.module('sailplay.actions', [])

    .provider('SailPlayActionsData', function () {

      var actions_data = {

        "system": {
          "emailBinding": {
            name: "Enter email"
          },
          "fillProfile": {
            name: "Fill profile"
          },
          "inviteFriend": {
            name: "Invite friend"
          }
        },
        "social": {
          "vk": {
            "like": {
              "name": "Join the group"
            },
            "partner_page": {
              "name": "Share our website on VK"
            },
            "purchase": {
              "name": "Share your purchase on VK"
            }
          },
          "fb": {
            "like": {
              "name": "Like Facebook group"
            },
            "partner_page": {
              "name": "Share our website on Facebook"
            },
            "purchase": {
              "name": "Share your purchase on Facebook"
            }
          },
          "gp": {
            "like": {
              "name": "Like G+ group"
            },
            "partner_page": {
              "name": "Share our website on G+"
            },
            "purchase": {
              "name": "Share your purchase on G+"
            }
          },
          "ok": {
            "like": {
              "name": "Join the group"
            },
            "partner_page": {
              "name": "Share our website on Odnoklassniki"
            },
            "purchase": {
              "name": "Share you purchase on Odnoklassniki"
            }
          },
          "tw": {
            "partner_page": {
              "name": "Share our website on twitter"
            },
            "purchase": {
              "name": "Share your purchase on twitter"
            }
          }
        }
      };

      return {

        set_actions_data: function (data) {

          angular.merge(actions_data, data);

        },

        $get: function () {

          return actions_data;

        }

      };

    })

    /**
     * @ngdoc directive
     * @name sailplay.actions.directive:sailplayActions
     * @scope
     * @restrict A
     *
     * @description
     * SailPlay profile directive used for rendering sailplay actions, sush as: fill profile, invite friend and social sharing. =)
     *
     */
    .directive('sailplayActions', function (SailPlayApi, SailPlay, SailPlayActionsData) {

      return {

        restrict: 'A',
        replace: false,
        scope: true,
        link: function (scope) {

          // HARDCODE
          SailPlay.on('actions.social.gp.like.mouseenter', function () {
            var elms = document.querySelectorAll('iframe[iframe-action-gp-like], iframe.gp.like');
            var originWidth,
              w = 400,
              h = 500;
            for (var i = 0, len = elms.length; i < len; i++) {
              elms[i].removeAttribute("style");
              elms[i].style.cssText = 'width: ' + w + 'px !important;height: ' + h + 'px !important;margin-left: auto !important;z-index: 10 !important;';
              elms[i].parentNode.style.setProperty("overflow", "visible", "important");
            }
          });

          SailPlay.on('actions.social.gp.like.mouseleave', function () {
            var elms = document.querySelectorAll('iframe[iframe-action-gp-like], iframe.gp.like');
            var w = 150,
              h = 27;
            for (var i = 0, len = elms.length; i < len; i++) {
              elms[i].removeAttribute("style");
              elms[i].style.cssText = 'width: ' + w + 'px !important;height: ' + h + 'px !important;margin-left: auto !important;';
              elms[i].parentNode.style.setProperty("overflow", "hidden", "important");
            }
          });

          scope.actions = SailPlayApi.data('load.actions.list');
          scope.exist = SailPlayApi.data('tags.exist');

          scope.perform_action = function (action) {

            SailPlay.send('actions.perform', action);

          };

          SailPlay.on('actions.perform.success', function (res) {

            scope.$apply(function () {

              scope.on_perform && scope.on_perform(res);

            });


          });

          scope.check_to_exist = function (tag, array) {

            if (!tag || !array) return false;

            return array.tags.filter(function (item) {
              return item.name == tag && item.exist
            }).length

          };

          scope.link_action_click = function (action) {

            var tag = action.tag;

            scope.link_action = false;

            SailPlayApi.call('tags.add', {tags: [tag]});

            window.open(action.url)

          };

          scope.action_data = function (action) {

            var data = {};

            if (!action) return data;

            data = action;

            if (action.socialType) data = SailPlayActionsData.social[action.socialType] && SailPlayActionsData.social[action.socialType][action.action];

            if (SailPlayActionsData.system[action.type]) data = SailPlayActionsData.system[action.type];

            return data;

          };

        }

      };

    })

    /**
     * @ngdoc directive
     * @name sailplay.actions.directive:sailplayAction
     * @scope
     * @restrict A
     *
     * @description
     * Simple directive for parsing dom element as SailPlay action.
     *
     * @param {object}  action   A SailPlay action object, received from api.
     * @param {string}  styles   Not required attribute, used for custom styling iframe buttons.
     * @param {string}  text   Not required attribute, used for custom text in iframe buttons.
     *
     */
    .directive('sailplayAction', function (SailPlay, $timeout, $compile) {

      var init_state;

      return {

        restrict: 'A',
        replace: false,
        scope: {
          action: '='
        },
        link: function (scope, elm, attrs) {

          init_state = elm[0].innerHTML;

          elm.on('click', function (e) {
            e.preventDefault();
          });

          function parse_action(action) {
            $timeout(function () {
              attrs.styles && elm.attr('data-styles', attrs.styles);
              attrs.text && elm.attr('data-text', attrs.text);
              SailPlay.actions && action && SailPlay.actions.parse(elm[0], action);
            }, 0);
          }

          scope.$watch('action', function (new_value) {
            if (new_value) {
              elm.html(init_state);
              parse_action(new_value);
            }
          });

        }

      };

    });

}());
