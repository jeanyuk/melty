import * as vscode from 'vscode';
import { sendMessageToAider } from './aider';

let chatMessages: string[] = [];

export class SpectacularChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'spectacularChat';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {
        console.log('SpectacularChatViewProvider constructor called');
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        console.log('Resolving webview view...');
        console.log('Setting webview view');
        this._view = webviewView;

        console.log('Configuring webview options');
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        console.log('Setting webview HTML content');
        webviewView.webview.html = this.getWebviewContent(webviewView.webview);

        console.log('Setting up message listener');
        webviewView.webview.onDidReceiveMessage(
            async message => {
                console.log('Received message:', message);
                switch (message.command) {
                    case 'sendMessage':
                        console.log('Sending message to Aider:', message.text);
                        const response = await sendMessageToAider(message.text);
                        console.log('Received response from Aider:', response);
                        chatMessages.push(`User: ${message.text}`);
                        chatMessages.push(`Aider: ${response}`);
                        this._view?.webview.postMessage({ command: 'receiveMessage', text: response });
                        break;
                    default:
                        console.log('Unknown command received:', message.command);
                }
            }
        );

        // Restore chat history                                                                                                                                                          
        console.log('Restoring chat messages');
        webviewView.webview.postMessage({ command: 'restoreMessages', messages: chatMessages });
    }

    private getWebviewContent(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

        return `                                                                                                                                                                         
             <!DOCTYPE html>                                                                                                                                                              
             <html lang="en">                                                                                                                                                             
             <head>                                                                                                                                                                       
                 <meta charset="UTF-8">                                                                                                                                                   
                 <meta name="viewport" content="width=device-width, initial-scale=1.0">                                                                                                   
                 <title>Spectacular Chat</title>                                                                                                                                          
                 <link href="${styleUri}" rel="stylesheet">                                                                                                                               
             </head>                                                                                                                                                                      
             <body>                                                                                                                                                                       
                 <div id="chat-container">                                                                                                                                                
                     <div id="messages"></div>                                                                                                                                            
                     <input id="message-input" type="text" placeholder="Type a message..."/>                                                                                              
                     <button id="send-button">Send</button>                                                                                                                               
                 </div>                                                                                                                                                                   
                 <script src="${scriptUri}"></script>                                                                                                                                     
             </body>                                                                                                                                                                      
             </html>                                                                                                                                                                      
         `;
    }
}                                                                                                                                                                                        
