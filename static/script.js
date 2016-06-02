$(function() {
    var UserModel = Backbone.Model.extend({
        "urlRoot": "/users",
        "id": "id",
        "defaults": function() {
            // generate a random number and convert it to base 36
            return {
                "id": md5(Math.random().toString(36).substr(2)),
                "name": "Name",
                "age": 18,
                "email": "example@example.example"
            };
        }
    });

    var UserView = Backbone.View.extend({
        "templateView": _.template("\
            <tr>\
                <td>\
                    <%=user.name%>\
                </td>\
                <td>\
                    <%=user.age%>\
                </td>\
                <td>\
                    <%=user.email%>\
                </td>\
                <td>\
                    <botton class='btn btn-danger' data-action='delete' data-id=<%=user.id%>>delete</botton>\
                    <botton class='btn btn-primary' data-action='edit' data-id=<%=user.id%>>edit</botton>\
                </td>\
            <tr>\
        "),
        "templateEdit": _.template("\
            <div class='modal fade' id='edit-modal' role='dialog'>\
                <div class='modal-dialog'>\
                    <div class='modal-content'>\
                        <div class='modal-header'>\
                        <button type='button' class='close' data-dismiss='modal'>&times;</button>\
                        <h4 class='modal-title'><%=title%></h4>\
                      </div>\
                    <div class='modal-body'>\
                        <form role='form'>\
                            <div class='form-group'>\
                                <label>Name:</label>\
                                <input type='text' class='form-control' value=<%=user.name%> name='name'>\
                            </div>\
                            <div class='form-group'>\
                                <label>Age:</label>\
                                <input type='number' class='form-control'value=<%=user.age%> name='age'>\
                            </div>\
                            <div class='form-group'>\
                                <label>Email:</label>\
                                <input type='email' class='form-control' value=<%=user.email%> name='email'>\
                            </div>\
                            <button type='submit' class='btn btn-success'>Submit</button>\
                        </form>\
                    </div>\
                    <div class='modal-footer'>\
                        <button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>\
                    </div>\
                </div>\
          </div>\
        "),
        "initialize": function(user) {
            _.bindAll(this, "render");
            this.render();
        },
        "renderView": function() {
            this.setElement(this.templateView({
                "user": this.model.toJSON()
            }));

            return this;
        },
        "renderEdit": function() {
            this.setElement(this.templateEdit({
                "user": this.model.toJSON(),
                "title": "Edit user"
            }));

            return this;
        },
        "renderAdd": function() {
            this.setElement(this.templateEdit({
                "user": this.model.toJSON(),
                "title": "Add user"
            }));

            return this;
        }
    })

    var UsersCollection = Backbone.Collection.extend({
        "url": "/users",
        "model": UserModel
    });

    var UsersView = Backbone.View.extend({
        "el": $("#users-table-body"),
        "events": {
            "click [data-action='delete']": "deleteUser",
            "click [data-action='edit']": "editUser"
        },
        "initialize": function() {
            _.bindAll(this, "render", "deleteUser", "editUser", "addUser");
            var self = this;
            $("#addUser").on("click", function() {
                self.addUser();
            });
            this.collection = new UsersCollection();
            this.collection.fetch({
                "success": function(usersModels) {
                    self.render();
                }
            });
        },
        "render": function() {
            this.$el.empty();
            this.collection.each(function(user) {
                var userView = new UserView({
                    "model": user
                });
                this.$el.append(userView.renderView().el);
            }, this);

            return this;
        },
        "deleteUser": function(event) {
            var self = this;
            var user = this.collection.get($(event.target).data("id").toString());

            user.destroy({
                "dataType": "text",
                "success": function(model, response) {
                    self.collection.remove(user);
                    self.render();
                }
            });
        },
        "editUser": function(event) {
            var self = this;
            var user = this.collection.get($(event.target).data("id").toString());

            var userView = new UserView({
                "model": user
            });

            var modal = userView.renderEdit();

            $("#user-edit").append(modal.el);
            modal.$el.modal("show");

            $("#user-edit").find("form").on("submit", function(event) {
                event.preventDefault();

                _.each($(this).find("input"), function(input) {
                    user.set($(input).attr("name"), $(input).val());
                });

                user.save(null, {
                    "dataType": "text",
                    "type": "PUT",
                    "success": function(data) {
                        // remove modal on success
                        modal.$el.modal("hide");
                        $("body").removeClass("modal-open");
                        $(".modal-backdrop").remove();
                        modal.$el.remove();

                        self.render();
                    }
                });
            });
        },
        "addUser": function() {
            var self = this;
            var user = new UserModel();
            var userView = new UserView({
                "model": user
            });

            var modal = userView.renderAdd();

            $("#user-edit").append(modal.el);
            modal.$el.modal("show");

            $("#user-edit").find("form").on("submit", function(event) {
                event.preventDefault();

                _.each($(this).find("input"), function(input) {
                    user.set($(input).attr("name"), $(input).val());
                });

                user.save(null, {
                    "dataType": "text",
                    "type": "POST",
                    "success": function(data) {
                        // remove modal on success
                        modal.$el.modal("hide");
                        $("body").removeClass("modal-open");
                        $(".modal-backdrop").remove();
                        modal.$el.remove();

                        self.collection.add(user);
                        self.render();
                    }
                });
            });
        }
    });

    Backbone.history.start({
        "pushState": true
    });

    var usersView = new UsersView({
        "collection": UsersCollection
    });
});
