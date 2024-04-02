/**
 * Apply an action on the client that first creates the action on both the client and server, then 
 * simulates the action, opening the action dialog if necessary to get input from the user, saving
 * the decisions the user makes, then applying the  action as a method call to the server with the
 * saved decisions, which will persist the action results.
 */

import Task from '/imports/api/engine/action/tasks/Task';

export default function doClientAction(propIdOrTask: string | Task) {

}
