import * as vscode from 'vscode';
import { TodoProvider } from './TodoProvider';

let todoProvider: TodoProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('Todo List Extension активирован');

    if (!todoProvider) {
        todoProvider = new TodoProvider();
    }

    const treeView = vscode.window.createTreeView('todoList', { treeDataProvider: todoProvider });

    context.subscriptions.push(treeView);

    const goToTodo = vscode.commands.registerCommand('todo-list.goToTodo', (location: vscode.Location) => {
        vscode.window.showTextDocument(location.uri).then(editor => {
            const position = location.range.start;
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
        });
    });

    const refreshTodoList = vscode.commands.registerCommand('todo-list.refresh', () => {
        todoProvider.scanTodos();
    });

    context.subscriptions.push(goToTodo);
    context.subscriptions.push(refreshTodoList);
}

export function deactivate() {
    console.log('Todo List Extension деактивирован');
}
