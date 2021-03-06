import ActivatableControllerMixin from 'client/mixins/activatable-controller';
import SortableControllerMixin from 'client/mixins/sortable-controller';
import ListControlsControllerMixin from 'client/mixins/list-controls-controller';

var GroupsController = Em.ArrayController.extend(ActivatableControllerMixin, SortableControllerMixin, ListControlsControllerMixin, {
  needs: ['application', 'group/index',  'group/edit', 'items'],

  // user-controlled sort order
  sortedTitleAsc: Ember.computed.equal('userSorted', 'title-asc'),

  actions: {
    sortByTitle: function () {
      var direction = this.get('userSorted') === 'title-asc' ? false : true;
      this.set('sortProperties', ['title']);
      this.set('sortAscending', direction);
    },

    delete: function (group) {
      var self = this;

      if(!confirm('Are you sure you want to delete ' + Ember.get(group, 'title') + '? This will also delete all its dependent items!')) {
        return;
      }

      this.api.deleteModel('groups', group).then(function () {
        var id = Ember.get(group, 'id'),
            routeName = self.get('controllers.application').get('currentRouteName');

        // if we just deleted a group we were editing or viewing
        if (routeName.indexOf('group.index') !== -1 && self.get('controllers.group/index').get('model.id') === id) {
          self.transitionToRoute('groups');
        }
        if (routeName.indexOf('group.edit') !== -1 && self.get('controllers.group/edit').get('model.id') === id) {
          self.transitionToRoute('groups');
        }

        // if we just deleted the group whose items we were looking at, we must transition away
        if (routeName.indexOf('item') !== -1 && self.get('controllers.items').get('GroupId') === id) {
          self.transitionToRoute('groups');
        }

        self.store.deleteModels('groups', group);
        self.store.seekAndDestroy('items', 'GroupId', id);
      }).catch(function () {
        alert('Sorry, something went wrong deleting your group! Please try again later.');
      });
    },
  }
});

export default GroupsController;
