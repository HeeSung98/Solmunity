import sys
import os
import graphviz
import boto3
from pathlib import Path
from solidity_parser import parser
from time import time


def s3_connection():
    try:
        # s3 클라이언트 생성
        s3 = boto3.client(
            service_name="s3",
            region_name="ap-northeast-2",
            aws_access_key_id="AKIAVO5NLNBM3VISJPVS",
            aws_secret_access_key="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",
        )
    except Exception as e:
        print(e)
    else:
        print("s3 bucket connected!")
        return s3


class CFG:
    def __init__(self):
        self.nodes = []

    def add_node(self, node):
        """노드를 CFG에 추가합니다."""
        self.nodes.append(node)

    def last_node(self):
        return self.nodes[len(self.nodes) - 1]

    def cfg_to_dot(self):
        viz_code = ""

        for node in self.nodes:
            if node.name == "Condition" or node.name == "LoopCondition":
                viz_code += f'{node.id} [label = "{node.name}{" ".join(f"{feature}" for feature in node.feature)}", shape = diamond];\n'
                viz_code += node.node_to_dot()
            elif node.feature:
                viz_code += f'{node.id} [label = "{node.name}{" ".join(f"{feature}" for feature in node.feature)}"];\n'
                viz_code += node.node_to_dot()
            else:
                viz_code += f"{node.id} [label = {node.name}];\n"
                viz_code += node.node_to_dot()

                # 시작적인 복잡함 해결
                if node.name == "WhileEnd" or node.name == "ForEnd":
                    viz_code += f'{{rank=same; {str(node.id)}; {str(node.id - 1)}}}\n'

        return viz_code


class GlobalCounter:
    def __init__(self):
        self.num = -1

    def counter(self):
        self.num += 1
        return self.num


class Node:
    def __init__(self, name, id):
        self.name = name
        self.id = id
        self.successors = []
        self.feature = []

    def add_successor(self, successor):
        """연결된 후속 노드를 추가합니다   ++."""
        self.successors.append(successor)

    def node_to_dot(self):
        viz_code = ""

        if len(self.successors) > 1:
            viz_code += f'{self.id} -> {self.successors[0]} [label = "true", fontcolor="blue"];\n'
            viz_code += f'{self.id} -> {self.successors[1]} [label = "false", fontcolor="red"];\n'
        elif len(self.successors) == 1:
            viz_code += f'{self.id} -> {self.successors[0]};\n'

        return viz_code


# ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

node_counter = GlobalCounter()
function_counter = GlobalCounter()
variable_counter = GlobalCounter()
function_dict = dict()
variable_dict = dict()

cfg_list = []


# 노드를 받아와 해당 노드에서 feature를 문자열로 리턴
def create_feature(node):
    feature = ""

    if isinstance(node, list):
        for item in node:
            if isinstance(item, dict):
                feature += create_feature(item)
        return feature

    # 함수 표현
    elif node['type'] == 'FunctionCall':
        if node['expression']['type'] == 'Identifier':
            name = node['expression']['name']

            # 함수명 딕셔너리에 해당 키가 없으면 생성
            if name not in function_dict:
                function_dict[name] = str(function_counter.counter())

            feature += "function" + function_dict[name] + '('
            length = len(node['arguments'])
            for i in range(length):
                if i == 0:
                    feature += create_feature(node['arguments'][i])
                else:
                    feature += ', ' + create_feature(node['arguments'][i])
            feature += ')'
            return feature

        # variable.push() 이런애들
        elif node['expression']['type'] == 'MemberAccess':
            feature = create_feature(node['expression']) + '('
            length = len(node['arguments'])
            for i in range(length):
                if i == 0:
                    feature += create_feature(node['arguments'][i])
                else:
                    feature += ', ' + create_feature(node['arguments'][i])
            feature += ')'
            return feature

    # 점
    elif node['type'] == 'MemberAccess':
        feature = create_feature(node['expression']) + '.' + node['memberName']
        return feature

    # for문에서 변수 선언부의 자료형 제거 + '=' 생성
    elif node['type'] == 'VariableDeclarationStatement':
        # ast구조에 예외가 없다는 가정하에 진행한 내용
        feature = create_feature(
            node['variables']) + " = " + create_feature(node['initialValue'])
        return feature
    elif node['type'] == 'ElementaryTypeName':
        return feature

    # 중위식 표현
    elif node['type'] == 'BinaryOperation':
        feature = create_feature(
            node['left']) + ' ' + node['operator'] + ' ' + create_feature(node['right'])
        return feature

    # 증감 연산자 표현
    elif node['type'] == 'UnaryOperation':
        # 전위
        if node['isPrefix'] == True:
            feature = node['operator'] + create_feature(node['subExpression'])
        # 후위
        elif node['isPrefix'] == False:
            feature = create_feature(node['subExpression']) + node['operator']
        return feature

    # 배열
    elif node['type'] == 'IndexAccess':
        feature = create_feature(node['base']) + \
            '[' + create_feature(node['index']) + ']'
        return feature

    for key, value in node.items():
        if isinstance(value, dict):
            feature += create_feature(value)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    feature += create_feature(item)

        elif isinstance(value, str):
            if key == 'name':
                if value in variable_dict:
                    feature += "variable" + variable_dict[value]
                elif value not in variable_dict:
                    variable_dict[value] = str(variable_counter.counter())
                    feature += "variable" + variable_dict[value]
            elif key == 'number':
                if '.' in value:
                    feature += 'decimal'
                else:
                    feature += 'integer'
            elif key == 'operator':
                feature += value
            elif key == 'visibility':
                feature += value
            elif key == 'value':
                feature += 'string'
        elif isinstance(value, bool):
            if key == 'value':
                if value == True:
                    feature += 'True'
                elif value == False:
                    feature += 'False'

    return feature


def conditional_statement_processing(node, cfg=None):
    # Block 하위 리스트 순회
    for children in node['statements']:

        # return; 처리
        if children == None:
            return_node = Node("return", node_counter.counter())
            cfg.last_node().add_successor(return_node.id)
            cfg.add_node(return_node)
            return

        node_type = children['type']
        last_node = cfg.last_node()

        # 정의 처리부
        if node_type == 'ExpressionStatement':
            if last_node.name == 'Expression':
                traverse(children['expression'], cfg, cfg.last_node())
            else:
                node_id = node_counter.counter()
                expression_node = Node("Expression", node_id)

                (cfg.last_node()).add_successor(expression_node.id)
                cfg.add_node(expression_node)

                traverse(children['expression'], cfg, expression_node)

        # 선언 및 정의
        elif node_type == 'VariableDeclarationStatement':
            if children['initialValue']:
                if last_node.name == 'Expression':
                    traverse(children, cfg, cfg.last_node())
                else:
                    node_id = node_counter.counter()
                    expression_node = Node("Expression", node_id)

                    (cfg.last_node()).add_successor(expression_node.id)
                    cfg.add_node(expression_node)

                    traverse(children, cfg, expression_node)

        # 리턴 처리부
        elif (node_type == 'Identifier' or node_type == 'BinaryOperation'
              or node_type == 'NumberLiteral' or node_type == 'IndexAccess'):
            node_id = node_counter.counter()
            return_node = Node("return", node_id)
            return_node.feature.append("\n" + create_feature(children))
            cfg.last_node().add_successor(return_node.id)
            cfg.add_node(return_node)
        elif node_type == 'TupleExpression':
            return_node = Node("return", node_counter.counter())
            for component in children['components']:
                return_node.feature.append("\n" + create_feature(component))
            cfg.last_node().add_successor(return_node.id)
            cfg.add_node(return_node)

        # If문 처리부
        elif node_type == 'IfStatement':
            node_id = node_counter.counter()
            condition_node = Node("Condition", node_id)
            (cfg.last_node()).add_successor(condition_node.id)
            cfg.add_node(condition_node)
            traverse(children['condition'], cfg, condition_node)

            node_id = node_counter.counter()
            ifEnd_node = Node("IfEnd", node_id)

            traverse(children['TrueBody'], cfg, condition_node)
            if cfg.last_node().name != "return":
                cfg.last_node().add_successor(ifEnd_node.id)

            if not children['FalseBody']:
                condition_node.add_successor(ifEnd_node.id)
            else:
                traverse(children['FalseBody'], cfg, condition_node)
                if cfg.last_node().name != "return":
                    cfg.last_node().add_successor(ifEnd_node.id)

            cfg.add_node(ifEnd_node)

        # While문 처리부
        elif node_type == 'WhileStatement':
            node_id = node_counter.counter()
            loopCondition_node = Node("LoopCondition", node_id)
            (cfg.last_node()).add_successor(loopCondition_node.id)
            cfg.add_node(loopCondition_node)
            traverse(children['condition'], cfg, loopCondition_node)

            traverse(children['body'], cfg, loopCondition_node)
            (cfg.last_node()).add_successor(loopCondition_node.id)

            node_id = node_counter.counter()
            whileEnd_node = Node("WhileEnd", node_id)
            cfg.add_node(whileEnd_node)
            loopCondition_node.add_successor(whileEnd_node.id)

        # For문 처리부
        elif node_type == 'ForStatement':
            node_id = node_counter.counter()
            VariableDeclaration_node = Node("LoopVariable", node_id)
            (cfg.last_node()).add_successor(VariableDeclaration_node.id)
            cfg.add_node(VariableDeclaration_node)
            traverse(children['initExpression'], cfg, VariableDeclaration_node)

            node_id = node_counter.counter()
            loopCondition_node = Node("LoopCondition", node_id)
            (cfg.last_node()).add_successor(loopCondition_node.id)
            cfg.add_node(loopCondition_node)
            traverse(children['conditionExpression'], cfg, loopCondition_node)

            traverse(children['body'], cfg, loopCondition_node)

            node_id = node_counter.counter()
            loopExpression_node = Node("LoopExpression", node_id)
            cfg.last_node().add_successor(loopExpression_node.id)
            cfg.add_node(loopExpression_node)
            traverse(children['loopExpression']
                     ['expression'], cfg, loopExpression_node)
            (cfg.last_node()).add_successor(loopCondition_node.id)

            node_id = node_counter.counter()
            forEnd_node = Node("ForEnd", node_id)
            cfg.add_node(forEnd_node)
            loopCondition_node.add_successor(forEnd_node.id)


def create_cfg(node):
    cfg = CFG()
    node_id = node_counter.counter()
    function_node = Node("Function", node_id)
    cfg.add_node(function_node)

    # 매개변수에 대한 내용은 추가할거면 여기에

    traverse(node['body'], cfg, function_node)

    # FunctionEnd
    node_id = node_counter.counter()
    functionend_node = Node("FunctionEnd", node_id)
    for node in cfg.nodes:
        if not node.successors:
            node.add_successor(functionend_node.id)
    cfg.add_node(functionend_node)
    return cfg


def traverse(node, cfg=None, prev_node=None):
    node_type = node.get('type')

    if not node_type:
        return
    # 함수선언부
    elif node_type == 'FunctionDefinition':
        if isinstance(node['body'], list):
            pass
        else:
            cfg_list.append(create_cfg(node))
        return
    # 함수 외부에서 선언 및 선언 & 정의 / 이벤트 정의 등은 사용하지 않음
    elif (node_type == 'StateVariableDeclaration' or node_type == 'UsingForDeclaration'
          or node_type == 'InheritanceSpecifier' or node_type == 'EventDefinition'
          or node_type == 'PragmaDirective' or node_type == 'ModifierDefinition' or node_type == 'StructDefinition'):
        return
    # 연산자 + 단순 식별자(condition 단일값) + 점 연산자 + 배열
    elif (node_type == 'BinaryOperation' or node_type == 'UnaryOperation'
          or node_type == 'Identifier' or node_type == 'MemberAccess' or node_type == 'IndexAccess'):
        prev_node.feature.append("\n" + create_feature(node))
        return
    # for문 변수 선언부 or 변수에 값 할당
    elif node_type == 'VariableDeclarationStatement' or node_type == 'ExpressionStatement':
        prev_node.feature.append("\n" + create_feature(node))
        return
    # FunctionCall
    elif node_type == 'FunctionCall':
        prev_node.feature.append("\n" + create_feature(node))
        return

    if node_type == 'SourceUnit' or node_type == 'ContractDefinition':
        current_node = None
    else:
        node_id = node_counter.counter()
        current_node = Node(node_type, node_id)
        cfg.add_node(current_node)

    if prev_node:
        prev_node.add_successor(current_node.id)

    if node_type == 'Block':
        conditional_statement_processing(node, cfg)
        return

    for key, value in node.items():
        if isinstance(value, dict):
            traverse(value, cfg, current_node)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    traverse(item, cfg, current_node)


# ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

def ast_to_cfg(ast):
    try:
        traverse(ast)

        viz_code = 'digraph G {\nnode[shape=box, style=rounded, fontname="Sans"]\n'

        for cfg in cfg_list:
            viz_code += cfg.cfg_to_dot()
        viz_code += '}'

        return viz_code
    except Exception as e:
        print(str(e))


def solidity_to_ast(solidity_code):
    try:
        ast = parser.parse(solidity_code, loc=False)

        return ast
    except Exception as e:
        print(str(e))


def generate(file_name, solidity_code):
    try:
        ast = solidity_to_ast(solidity_code)
        viz_code = ast_to_cfg(ast)

        cfg = graphviz.Source(viz_code)
        cfg.format = 'png'

        current_time = str(time()).split('.')[0]
        file_name = "CFG-" + current_time + "-" + file_name

        s3 = s3_connection()
        try:
            s3.upload_file(
                cfg.render(filename=file_name),
                "heesung-s3", file_name)
        except Exception as e:
            print(e) 
        
        print(file_name)

        return viz_code

    except Exception as e:
        print(e)
    

# ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ


if __name__ == '__main__':
    generate(sys.argv[1], sys.argv[2])