package com.code3d.engine;

import com.code3d.model.ConditionInfo;
import com.code3d.model.DataStructureState;
import com.code3d.model.ExecuteResponse;
import com.code3d.model.ExecutionStep;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.Parameter;
import com.github.javaparser.ast.body.VariableDeclarator;
import com.github.javaparser.ast.expr.*;
import com.github.javaparser.ast.stmt.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * CODE3D-AI - Production AST Execution Engine for Java
 *
 * Real AST interpretation and step-by-step execution trace generation using JavaParser.
 * Features:
 * - Dynamic variables (primitive types, String, Scanner, arrays)
 * - Array operations (creation, indexing, element update, length)
 * - Control flow (if/else, switch/case, for, while, do-while, break, continue)
 * - User-defined methods & recursion with call stack tracking
 * - System.out capture (print / println) and Scanner simulation
 * - Sandbox limits (steps, execution timeout, recursion depth, memory bounds)
 */
@Service
public class JavaAstExecutionEngine {

    private static final int MAX_EXECUTION_STEPS = 1000;
    private static final long MAX_EXECUTION_TIME_MS = 4000;
    private static final int MAX_OUTPUT_CHARS = 10000;
    private static final int MAX_CALL_STACK_DEPTH = 50;

    public ExecuteResponse execute(String rawCode) {
        return execute(rawCode, null);
    }

    public ExecuteResponse execute(String rawCode, String input) {
        if (rawCode == null || rawCode.isBlank()) {
            return ExecuteResponse.error("Code is empty.");
        }

        // 1. Security Check
        String lowerCode = rawCode.toLowerCase();
        if (lowerCode.contains("processbuilder") || lowerCode.contains("runtime.getruntime") ||
            lowerCode.contains("java.lang.reflect") || lowerCode.contains("java.nio") ||
            lowerCode.contains("java.net") || lowerCode.contains("system.exit")) {
            return ExecuteResponse.error("Unsupported Java construct: Forbidden security violation (process/network/reflection/filesystem execution is restricted).");
        }

        // 2. Parse Java AST
        CompilationUnit cu;
        int lineOffset = 0;
        try {
            if (rawCode.contains("class ") || rawCode.contains("interface ")) {
                cu = StaticJavaParser.parse(rawCode);
            } else {
                String wrapped = "public class Main {\n    public static void main(String[] args) {\n" + rawCode + "\n    }\n}";
                cu = StaticJavaParser.parse(wrapped);
                lineOffset = 2;
            }
        } catch (Exception parseEx) {
            return ExecuteResponse.error("Java Syntax Error: " + parseEx.getMessage());
        }

        // 3. Initialize Execution Context & Method Catalog
        ExecutionContext ctx = new ExecutionContext(lineOffset, input);
        List<MethodDeclaration> methods = cu.findAll(MethodDeclaration.class);
        for (MethodDeclaration m : methods) {
            ctx.methodMap.put(m.getNameAsString(), m);
        }

        // Locate Entry Method (main or first method)
        MethodDeclaration entryMethod = null;
        for (MethodDeclaration m : methods) {
            if ("main".equals(m.getNameAsString())) {
                entryMethod = m;
                break;
            }
        }
        if (entryMethod == null && !methods.isEmpty()) {
            entryMethod = methods.get(0);
        }

        if (entryMethod == null || entryMethod.getBody().isEmpty()) {
            return ExecuteResponse.error("No executable method body found in Java source code.");
        }

        ctx.callStack.push("main");
        long startTime = System.currentTimeMillis();

        // 4. Initial PROGRAM_START step
        ExecutionStep startStep = new ExecutionStep();
        startStep.setStepNumber(ctx.stepCounter++);
        startStep.setLineNumber(getSourceLine(entryMethod, ctx));
        startStep.setEventType("PROGRAM_START");
        startStep.setCallStack(new ArrayList<>(ctx.callStack));
        startStep.setVariables(new LinkedHashMap<>(ctx.variables));
        startStep.setOutput(new ArrayList<>(ctx.stdout));
        startStep.setExplanation("Program execution started at entry method '" + entryMethod.getNameAsString() + "'.");
        startStep.setDataStructureState(ctx.buildDataStructureState("Program Started", "Entry: " + entryMethod.getNameAsString()));
        ctx.steps.add(startStep);

        try {
            BlockStmt body = entryMethod.getBody().get();
            executeBlock(body, ctx, startTime);
        } catch (ReturnException re) {
            // Normal return from entry method
        } catch (ExecutionTimeoutException te) {
            return ExecuteResponse.error("Execution Timeout: Code exceeded 4000ms execution limit (possible infinite loop).");
        } catch (StepLimitExceededException se) {
            return ExecuteResponse.error("Execution Limit: Program exceeded limit (" + se.getMessage() + ").");
        } catch (UnsupportedConstructException ue) {
            return ExecuteResponse.error("Unsupported Java construct: " + ue.getMessage());
        } catch (IndexOutOfBoundsException oob) {
            ExecutionStep errStep = new ExecutionStep();
            errStep.setStepNumber(ctx.stepCounter++);
            errStep.setLineNumber(ctx.currentLine);
            errStep.setEventType("EXCEPTION");
            errStep.setExplanation("ArrayIndexOutOfBoundsException: " + oob.getMessage());
            errStep.setCallStack(new ArrayList<>(ctx.callStack));
            errStep.setVariables(new LinkedHashMap<>(ctx.variables));
            ctx.stdout.add("[Exception] " + oob.getMessage());
            errStep.setOutput(new ArrayList<>(ctx.stdout));
            errStep.setDataStructureState(ctx.buildDataStructureState("Runtime Exception", oob.getMessage()));
            ctx.steps.add(errStep);
            ExecuteResponse resp = new ExecuteResponse("ERROR", ctx.steps.size(), ctx.steps);
            resp.setError(oob.getMessage());
            return resp;
        } catch (Exception ex) {
            return ExecuteResponse.error("Runtime Evaluation Error: " + ex.getMessage());
        }

        // 5. Final PROGRAM_END step
        if (!ctx.steps.isEmpty()) {
            ExecutionStep last = ctx.steps.get(ctx.steps.size() - 1);
            if (!"PROGRAM_END".equals(last.getEventType())) {
                ExecutionStep endStep = new ExecutionStep();
                endStep.setStepNumber(ctx.stepCounter++);
                endStep.setLineNumber(last.getLineNumber());
                endStep.setEventType("PROGRAM_END");
                endStep.setCallStack(new ArrayList<>(ctx.callStack));
                endStep.setVariables(new LinkedHashMap<>(ctx.variables));
                endStep.setOutput(new ArrayList<>(ctx.stdout));
                endStep.setExplanation("Java program execution completed successfully with exit code 0.");
                endStep.setDataStructureState(ctx.buildDataStructureState("Program Completed", "Status 0"));
                ctx.steps.add(endStep);
            }
        }

        return new ExecuteResponse("SUCCESS", ctx.steps.size(), ctx.steps);
    }

    private void executeBlock(BlockStmt block, ExecutionContext ctx, long startTime) {
        for (Statement stmt : block.getStatements()) {
            checkLimits(ctx, startTime);
            executeStatement(stmt, ctx, startTime);
        }
    }

    private void executeStatement(Statement stmt, ExecutionContext ctx, long startTime) {
        checkLimits(ctx, startTime);

        if (stmt.isExpressionStmt()) {
            executeExpression(stmt.asExpressionStmt().getExpression(), stmt, ctx, startTime);
        } else if (stmt.isIfStmt()) {
            executeIf(stmt.asIfStmt(), ctx, startTime);
        } else if (stmt.isForStmt()) {
            executeFor(stmt.asForStmt(), ctx, startTime);
        } else if (stmt.isForEachStmt()) {
            executeForEach(stmt.asForEachStmt(), ctx, startTime);
        } else if (stmt.isWhileStmt()) {
            executeWhile(stmt.asWhileStmt(), ctx, startTime);
        } else if (stmt.isDoStmt()) {
            executeDoWhile(stmt.asDoStmt(), ctx, startTime);
        } else if (stmt.isSwitchStmt()) {
            executeSwitch(stmt.asSwitchStmt(), ctx, startTime);
        } else if (stmt.isBlockStmt()) {
            executeBlock(stmt.asBlockStmt(), ctx, startTime);
        } else if (stmt.isReturnStmt()) {
            executeReturn(stmt.asReturnStmt(), ctx, startTime);
        } else if (stmt.isBreakStmt()) {
            throw new BreakException();
        } else if (stmt.isContinueStmt()) {
            throw new ContinueException();
        } else {
            throw new UnsupportedConstructException("Statement type '" + stmt.getClass().getSimpleName() + "' is not supported.");
        }
    }

    private void executeExpression(Expression expr, Statement parentStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(expr, ctx);

        if (expr.isVariableDeclarationExpr()) {
            VariableDeclarationExpr vde = expr.asVariableDeclarationExpr();
            for (VariableDeclarator var : vde.getVariables()) {
                String name = var.getNameAsString();
                String type = var.getType().asString();
                Object val = null;

                if (var.getInitializer().isPresent()) {
                    val = evalExpression(var.getInitializer().get(), ctx, startTime);
                } else {
                    val = getDefaultValue(type);
                }

                ctx.variables.put(name, val);
                ctx.variableTypes.put(name, type);

                ExecutionStep s = new ExecutionStep();
                s.setStepNumber(ctx.stepCounter++);
                s.setLineNumber(line);
                s.setEventType(type.contains("[]") ? "ARRAY_ACCESS" : "VARIABLE_DECLARATION");
                s.setChangedVariable(name);
                s.setCurrentValue(val);
                s.setCallStack(new ArrayList<>(ctx.callStack));
                s.setVariables(new LinkedHashMap<>(ctx.variables));
                s.setOutput(new ArrayList<>(ctx.stdout));
                s.setExplanation("Declared " + type + " variable '" + name + "' = " + formatVal(val) + ".");
                s.setDataStructureState(ctx.buildDataStructureState(
                    type.contains("[]") ? "Array Created: " + name : "Variable Declared: " + name,
                    name + " = " + formatVal(val)
                ));
                ctx.steps.add(s);
            }
        } else if (expr.isAssignExpr()) {
            AssignExpr ae = expr.asAssignExpr();
            Expression target = ae.getTarget();
            Object rightVal = evalExpression(ae.getValue(), ctx, startTime);
            AssignExpr.Operator op = ae.getOperator();

            if (target.isNameExpr()) {
                String varName = target.asNameExpr().getNameAsString();
                Object prevVal = ctx.variables.get(varName);
                Object newVal = applyAssignOp(op, prevVal, rightVal);
                ctx.variables.put(varName, newVal);

                ExecutionStep s = new ExecutionStep();
                s.setStepNumber(ctx.stepCounter++);
                s.setLineNumber(line);
                s.setEventType("VARIABLE_ASSIGNMENT");
                s.setChangedVariable(varName);
                s.setPreviousValue(prevVal);
                s.setCurrentValue(newVal);
                s.setCallStack(new ArrayList<>(ctx.callStack));
                s.setVariables(new LinkedHashMap<>(ctx.variables));
                s.setOutput(new ArrayList<>(ctx.stdout));
                s.setExplanation("Variable '" + varName + "' assigned value " + formatVal(newVal) + ".");
                s.setDataStructureState(ctx.buildDataStructureState("Assignment: " + varName, varName + " = " + formatVal(newVal)));
                ctx.steps.add(s);
            } else if (target.isArrayAccessExpr()) {
                ArrayAccessExpr aae = target.asArrayAccessExpr();
                String arrName = aae.getName().asNameExpr().getNameAsString();
                int idx = ((Number) evalExpression(aae.getIndex(), ctx, startTime)).intValue();

                Object arrObj = ctx.variables.get(arrName);
                if (arrObj instanceof List<?> list) {
                    @SuppressWarnings("unchecked")
                    List<Object> modifiable = (List<Object>) list;
                    Object prevVal = (idx >= 0 && idx < modifiable.size()) ? modifiable.get(idx) : null;
                    Object newVal = applyAssignOp(op, prevVal, rightVal);
                    if (idx >= 0 && idx < modifiable.size()) {
                        modifiable.set(idx, newVal);
                    }

                    ExecutionStep s = new ExecutionStep();
                    s.setStepNumber(ctx.stepCounter++);
                    s.setLineNumber(line);
                    s.setEventType("ARRAY_UPDATE");
                    s.setChangedVariable(arrName + "[" + idx + "]");
                    s.setPreviousValue(prevVal);
                    s.setCurrentValue(newVal);
                    s.setCallStack(new ArrayList<>(ctx.callStack));
                    s.setVariables(new LinkedHashMap<>(ctx.variables));
                    s.setOutput(new ArrayList<>(ctx.stdout));
                    s.setExplanation("Updated " + arrName + "[" + idx + "] = " + newVal + ".");

                    DataStructureState ds = ctx.buildDataStructureState("Array Element Assigned", arrName + "[" + idx + "] = " + newVal);
                    ds.setActiveIndex(idx);
                    s.setDataStructureState(ds);
                    ctx.steps.add(s);
                }
            }
        } else if (expr.isMethodCallExpr()) {
            evalExpression(expr, ctx, startTime);
        } else if (expr.isUnaryExpr()) {
            evalUnary(expr.asUnaryExpr(), ctx, startTime);
        }
    }

    private void executeIf(IfStmt ifStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(ifStmt, ctx);
        Object condObj = evalExpression(ifStmt.getCondition(), ctx, startTime);
        boolean condVal = Boolean.TRUE.equals(condObj);

        ExecutionStep s = new ExecutionStep();
        s.setStepNumber(ctx.stepCounter++);
        s.setLineNumber(line);
        s.setEventType("CONDITION_CHECK");
        s.setCallStack(new ArrayList<>(ctx.callStack));
        s.setVariables(new LinkedHashMap<>(ctx.variables));
        s.setOutput(new ArrayList<>(ctx.stdout));

        ConditionInfo condInfo = new ConditionInfo();
        condInfo.setExpression(ifStmt.getCondition().toString());
        condInfo.setEvaluation(ifStmt.getCondition().toString() + " = " + condVal);
        condInfo.setResult(condVal);
        condInfo.setBranch(condVal ? "BRANCH TAKEN" : "BRANCH SKIPPED");
        s.setCondition(condInfo);

        s.setExplanation("Evaluated if (" + ifStmt.getCondition() + ") -> " + (condVal ? "TRUE (Entering branch)" : "FALSE (Skipping branch)"));
        s.setDataStructureState(ctx.buildDataStructureState(
            condVal ? "Condition True: Branch Taken" : "Condition False: Branch Skipped",
            ifStmt.getCondition().toString() + " = " + condVal
        ));
        ctx.steps.add(s);

        if (condVal) {
            executeStatement(ifStmt.getThenStmt(), ctx, startTime);
        } else if (ifStmt.getElseStmt().isPresent()) {
            executeStatement(ifStmt.getElseStmt().get(), ctx, startTime);
        }
    }

    private void executeFor(ForStmt forStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(forStmt, ctx);

        // Initializer
        for (Expression init : forStmt.getInitialization()) {
            executeExpression(init, forStmt, ctx, startTime);
        }

        while (true) {
            checkLimits(ctx, startTime);

            // Condition Check
            if (forStmt.getCompare().isPresent()) {
                Expression compExpr = forStmt.getCompare().get();
                Object condObj = evalExpression(compExpr, ctx, startTime);
                boolean condVal = Boolean.TRUE.equals(condObj);

                ExecutionStep s = new ExecutionStep();
                s.setStepNumber(ctx.stepCounter++);
                s.setLineNumber(line);
                s.setEventType("CONDITION_CHECK");
                s.setCallStack(new ArrayList<>(ctx.callStack));
                s.setVariables(new LinkedHashMap<>(ctx.variables));
                s.setOutput(new ArrayList<>(ctx.stdout));

                ConditionInfo condInfo = new ConditionInfo();
                condInfo.setExpression(compExpr.toString());
                condInfo.setEvaluation(compExpr.toString() + " = " + condVal);
                condInfo.setResult(condVal);
                condInfo.setBranch(condVal ? "ENTER LOOP BODY" : "EXIT LOOP");
                s.setCondition(condInfo);

                s.setExplanation("Loop condition '" + compExpr + "' evaluated to " + (condVal ? "TRUE" : "FALSE") + ".");
                DataStructureState ds = ctx.buildDataStructureState(
                    condVal ? "Loop Condition TRUE" : "Loop Condition FALSE (Exit)",
                    compExpr.toString() + " = " + condVal
                );
                s.setDataStructureState(ds);
                ctx.steps.add(s);

                if (!condVal) {
                    break;
                }
            }

            // Body
            try {
                executeStatement(forStmt.getBody(), ctx, startTime);
            } catch (ContinueException ce) {
                // Next iteration
            } catch (BreakException be) {
                break;
            }

            // Update
            for (Expression update : forStmt.getUpdate()) {
                executeExpression(update, forStmt, ctx, startTime);
            }
        }
    }

    private void executeForEach(ForEachStmt feStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(feStmt, ctx);
        Object iterable = evalExpression(feStmt.getIterable(), ctx, startTime);
        String varName = feStmt.getVariable().getVariables().get(0).getNameAsString();

        List<Object> items = new ArrayList<>();
        if (iterable instanceof List<?> list) {
            items.addAll(list);
        }

        for (int i = 0; i < items.size(); i++) {
            checkLimits(ctx, startTime);
            Object item = items.get(i);
            ctx.variables.put(varName, item);

            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(ctx.stepCounter++);
            s.setLineNumber(line);
            s.setEventType("LOOP_ITERATION");
            s.setCallStack(new ArrayList<>(ctx.callStack));
            s.setVariables(new LinkedHashMap<>(ctx.variables));
            s.setOutput(new ArrayList<>(ctx.stdout));
            s.setExplanation("Enhanced for-loop iteration " + (i + 1) + ": " + varName + " = " + formatVal(item));
            DataStructureState ds = ctx.buildDataStructureState("For-Each Element", varName + " = " + formatVal(item));
            ds.setActiveIndex(i);
            s.setDataStructureState(ds);
            ctx.steps.add(s);

            try {
                executeStatement(feStmt.getBody(), ctx, startTime);
            } catch (ContinueException ce) {
                // Continue
            } catch (BreakException be) {
                break;
            }
        }
    }

    private void executeWhile(WhileStmt whileStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(whileStmt, ctx);

        while (true) {
            checkLimits(ctx, startTime);
            Object condObj = evalExpression(whileStmt.getCondition(), ctx, startTime);
            boolean condVal = Boolean.TRUE.equals(condObj);

            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(ctx.stepCounter++);
            s.setLineNumber(line);
            s.setEventType("CONDITION_CHECK");
            s.setCallStack(new ArrayList<>(ctx.callStack));
            s.setVariables(new LinkedHashMap<>(ctx.variables));
            s.setOutput(new ArrayList<>(ctx.stdout));

            ConditionInfo condInfo = new ConditionInfo();
            condInfo.setExpression(whileStmt.getCondition().toString());
            condInfo.setEvaluation(whileStmt.getCondition().toString() + " = " + condVal);
            condInfo.setResult(condVal);
            condInfo.setBranch(condVal ? "ENTER LOOP BODY" : "EXIT LOOP");
            s.setCondition(condInfo);
            s.setExplanation("While condition '" + whileStmt.getCondition() + "' evaluated to " + condVal + ".");
            s.setDataStructureState(ctx.buildDataStructureState("While Condition: " + condVal, whileStmt.getCondition().toString()));
            ctx.steps.add(s);

            if (!condVal) {
                break;
            }

            try {
                executeStatement(whileStmt.getBody(), ctx, startTime);
            } catch (ContinueException ce) {
                // Continue
            } catch (BreakException be) {
                break;
            }
        }
    }

    private void executeDoWhile(DoStmt doStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(doStmt, ctx);

        do {
            checkLimits(ctx, startTime);
            try {
                executeStatement(doStmt.getBody(), ctx, startTime);
            } catch (ContinueException ce) {
                // Continue
            } catch (BreakException be) {
                break;
            }

            Object condObj = evalExpression(doStmt.getCondition(), ctx, startTime);
            boolean condVal = Boolean.TRUE.equals(condObj);

            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(ctx.stepCounter++);
            s.setLineNumber(line);
            s.setEventType("CONDITION_CHECK");
            s.setCallStack(new ArrayList<>(ctx.callStack));
            s.setVariables(new LinkedHashMap<>(ctx.variables));
            s.setOutput(new ArrayList<>(ctx.stdout));
            s.setExplanation("Do-While condition evaluated to " + condVal + ".");
            s.setDataStructureState(ctx.buildDataStructureState("Do-While Condition: " + condVal, doStmt.getCondition().toString()));
            ctx.steps.add(s);

            if (!condVal) break;
        } while (true);
    }

    private void executeSwitch(SwitchStmt ss, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(ss, ctx);
        Object selector = evalExpression(ss.getSelector(), ctx, startTime);

        ExecutionStep s = new ExecutionStep();
        s.setStepNumber(ctx.stepCounter++);
        s.setLineNumber(line);
        s.setEventType("CONDITION_CHECK");
        s.setCallStack(new ArrayList<>(ctx.callStack));
        s.setVariables(new LinkedHashMap<>(ctx.variables));
        s.setOutput(new ArrayList<>(ctx.stdout));
        s.setExplanation("Switch selector evaluated to: " + formatVal(selector));
        s.setDataStructureState(ctx.buildDataStructureState("Switch Check", "Selector = " + formatVal(selector)));
        ctx.steps.add(s);

        boolean matched = false;
        SwitchEntry defaultEntry = null;

        try {
            for (SwitchEntry entry : ss.getEntries()) {
                if (entry.getLabels().isEmpty()) {
                    defaultEntry = entry;
                    continue;
                }
                if (!matched) {
                    for (Expression label : entry.getLabels()) {
                        Object labelVal = evalExpression(label, ctx, startTime);
                        if (Objects.equals(selector, labelVal)) {
                            matched = true;
                            break;
                        }
                    }
                }
                if (matched) {
                    for (Statement stmt : entry.getStatements()) {
                        executeStatement(stmt, ctx, startTime);
                    }
                }
            }
            if (!matched && defaultEntry != null) {
                for (Statement stmt : defaultEntry.getStatements()) {
                    executeStatement(stmt, ctx, startTime);
                }
            }
        } catch (BreakException be) {
            // Break from switch
        }
    }

    private void executeReturn(ReturnStmt returnStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(returnStmt, ctx);
        Object retVal = returnStmt.getExpression().isPresent()
            ? evalExpression(returnStmt.getExpression().get(), ctx, startTime)
            : null;

        ExecutionStep s = new ExecutionStep();
        s.setStepNumber(ctx.stepCounter++);
        s.setLineNumber(line);
        s.setEventType("FUNCTION_RETURN");
        s.setCurrentValue(retVal);
        s.setCallStack(new ArrayList<>(ctx.callStack));
        s.setVariables(new LinkedHashMap<>(ctx.variables));
        s.setOutput(new ArrayList<>(ctx.stdout));
        s.setExplanation("Returned value: " + formatVal(retVal) + ".");
        s.setDataStructureState(ctx.buildDataStructureState("Return: " + formatVal(retVal), "Method Execution Complete"));
        ctx.steps.add(s);

        throw new ReturnException(retVal);
    }

    // ==========================================
    // Expression Evaluation Engine
    // ==========================================
    private Object evalExpression(Expression expr, ExecutionContext ctx, long startTime) {
        if (expr.isIntegerLiteralExpr()) {
            return expr.asIntegerLiteralExpr().asNumber().intValue();
        } else if (expr.isLongLiteralExpr()) {
            return expr.asLongLiteralExpr().asNumber().longValue();
        } else if (expr.isDoubleLiteralExpr()) {
            return expr.asDoubleLiteralExpr().asDouble();
        } else if (expr.isBooleanLiteralExpr()) {
            return expr.asBooleanLiteralExpr().getValue();
        } else if (expr.isCharLiteralExpr()) {
            return expr.asCharLiteralExpr().asChar();
        } else if (expr.isStringLiteralExpr()) {
            return expr.asStringLiteralExpr().getValue();
        } else if (expr.isNameExpr()) {
            String name = expr.asNameExpr().getNameAsString();
            if (ctx.variables.containsKey(name)) {
                return ctx.variables.get(name);
            }
            return name;
        } else if (expr.isArrayInitializerExpr()) {
            ArrayInitializerExpr aie = expr.asArrayInitializerExpr();
            List<Object> list = new ArrayList<>();
            for (Expression e : aie.getValues()) {
                list.add(evalExpression(e, ctx, startTime));
            }
            return list;
        } else if (expr.isArrayCreationExpr()) {
            ArrayCreationExpr ace = expr.asArrayCreationExpr();
            if (ace.getInitializer().isPresent()) {
                return evalExpression(ace.getInitializer().get(), ctx, startTime);
            }
            int size = 4;
            if (!ace.getLevels().isEmpty() && ace.getLevels().get(0).getDimension().isPresent()) {
                size = ((Number) evalExpression(ace.getLevels().get(0).getDimension().get(), ctx, startTime)).intValue();
            }
            List<Object> list = new ArrayList<>();
            for (int k = 0; k < size; k++) list.add(0);
            return list;
        } else if (expr.isArrayAccessExpr()) {
            ArrayAccessExpr aae = expr.asArrayAccessExpr();
            String arrName = aae.getName().asNameExpr().getNameAsString();
            int idx = ((Number) evalExpression(aae.getIndex(), ctx, startTime)).intValue();
            Object arrObj = ctx.variables.get(arrName);
            if (arrObj instanceof List<?> list) {
                if (idx >= 0 && idx < list.size()) {
                    return list.get(idx);
                } else {
                    throw new IndexOutOfBoundsException("Index " + idx + " out of bounds for length " + list.size());
                }
            }
            return 0;
        } else if (expr.isFieldAccessExpr()) {
            FieldAccessExpr fae = expr.asFieldAccessExpr();
            if ("length".equals(fae.getNameAsString())) {
                Object target = evalExpression(fae.getScope(), ctx, startTime);
                if (target instanceof List<?> list) {
                    return list.size();
                } else if (target instanceof String str) {
                    return str.length();
                }
            }
        } else if (expr.isBinaryExpr()) {
            BinaryExpr be = expr.asBinaryExpr();
            Object left = evalExpression(be.getLeft(), ctx, startTime);
            Object right = evalExpression(be.getRight(), ctx, startTime);
            return evalBinary(be.getOperator(), left, right);
        } else if (expr.isUnaryExpr()) {
            return evalUnary(expr.asUnaryExpr(), ctx, startTime);
        } else if (expr.isEnclosedExpr()) {
            return evalExpression(expr.asEnclosedExpr().getInner(), ctx, startTime);
        } else if (expr.isObjectCreationExpr()) {
            ObjectCreationExpr oce = expr.asObjectCreationExpr();
            String typeName = oce.getType().asString();
            if ("Scanner".equals(typeName)) {
                return "Scanner(System.in)";
            }
            return "Object(" + typeName + ")";
        } else if (expr.isMethodCallExpr()) {
            return executeMethodCall(expr.asMethodCallExpr(), ctx, startTime);
        }

        return expr.toString();
    }

    private Object executeMethodCall(MethodCallExpr mce, ExecutionContext ctx, long startTime) {
        String mName = mce.getNameAsString();
        int line = getSourceLine(mce, ctx);

        // 1. System.out.println / print
        if ("println".equals(mName) || "print".equals(mName)) {
            StringBuilder printBuf = new StringBuilder();
            for (Expression arg : mce.getArguments()) {
                Object v = evalExpression(arg, ctx, startTime);
                printBuf.append(formatVal(v));
            }
            String outStr = printBuf.toString();
            ctx.stdout.add(outStr);
            if (ctx.stdout.size() * 50 > MAX_OUTPUT_CHARS) {
                throw new ExecutionTimeoutException("Output limit exceeded");
            }

            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(ctx.stepCounter++);
            s.setLineNumber(line);
            s.setEventType("OUTPUT");
            s.setCurrentValue(outStr);
            s.setCallStack(new ArrayList<>(ctx.callStack));
            s.setVariables(new LinkedHashMap<>(ctx.variables));
            s.setOutput(new ArrayList<>(ctx.stdout));
            s.setExplanation("Output: " + outStr);
            s.setDataStructureState(ctx.buildDataStructureState("Output: " + outStr, outStr));
            ctx.steps.add(s);
            return outStr;
        }

        // 2. Scanner Methods: nextLine, nextInt, nextDouble, next
        if ("nextLine".equals(mName) || "next".equals(mName)) {
            String val = ctx.getNextStringInput();
            return val;
        }
        if ("nextInt".equals(mName)) {
            int val = ctx.getNextIntInput();
            return val;
        }
        if ("nextDouble".equals(mName) || "nextFloat".equals(mName)) {
            double val = ctx.getNextDoubleInput();
            return val;
        }

        // 3. User-Defined Methods & Recursion
        if (ctx.methodMap.containsKey(mName)) {
            if (ctx.callStack.size() >= MAX_CALL_STACK_DEPTH) {
                throw new StepLimitExceededException("Recursion depth exceeded limit (possible infinite recursion).");
            }

            MethodDeclaration targetMethod = ctx.methodMap.get(mName);
            List<Object> evalArgs = new ArrayList<>();
            List<String> argStrings = new ArrayList<>();
            for (Expression arg : mce.getArguments()) {
                Object val = evalExpression(arg, ctx, startTime);
                evalArgs.add(val);
                argStrings.add(formatVal(val));
            }

            String callDesc = mName + "(" + String.join(", ", argStrings) + ")";
            ctx.callStack.push(callDesc);

            // Record METHOD_CALL step
            ExecutionStep callStep = new ExecutionStep();
            callStep.setStepNumber(ctx.stepCounter++);
            callStep.setLineNumber(line);
            callStep.setEventType("METHOD_CALL");
            callStep.setCallStack(new ArrayList<>(ctx.callStack));
            callStep.setVariables(new LinkedHashMap<>(ctx.variables));
            callStep.setOutput(new ArrayList<>(ctx.stdout));
            callStep.setExplanation("Calling method " + callDesc + ".");
            callStep.setDataStructureState(ctx.buildDataStructureState("Method Call: " + mName, callDesc));
            ctx.steps.add(callStep);

            // Push scope & bind parameters
            ctx.scopeStack.push(new LinkedHashMap<>(ctx.variables));
            Map<String, Object> localVars = new LinkedHashMap<>();
            for (int i = 0; i < targetMethod.getParameters().size(); i++) {
                String pName = targetMethod.getParameter(i).getNameAsString();
                Object pVal = i < evalArgs.size() ? evalArgs.get(i) : null;
                localVars.put(pName, pVal);
            }
            ctx.variables.clear();
            ctx.variables.putAll(localVars);

            Object retVal = null;
            try {
                if (targetMethod.getBody().isPresent()) {
                    executeBlock(targetMethod.getBody().get(), ctx, startTime);
                }
            } catch (ReturnException ret) {
                retVal = ret.getValue();
            }

            // Restore previous scope & pop call stack
            ctx.callStack.pop();
            ctx.variables.clear();
            if (!ctx.scopeStack.isEmpty()) {
                ctx.variables.putAll(ctx.scopeStack.pop());
            }

            // Record FUNCTION_RETURN step
            ExecutionStep retStep = new ExecutionStep();
            retStep.setStepNumber(ctx.stepCounter++);
            retStep.setLineNumber(line);
            retStep.setEventType("FUNCTION_RETURN");
            retStep.setCurrentValue(retVal);
            retStep.setCallStack(new ArrayList<>(ctx.callStack));
            retStep.setVariables(new LinkedHashMap<>(ctx.variables));
            retStep.setOutput(new ArrayList<>(ctx.stdout));
            retStep.setExplanation("Method " + mName + " returned " + formatVal(retVal) + ".");
            retStep.setDataStructureState(ctx.buildDataStructureState("Return: " + mName, "Returned: " + formatVal(retVal)));
            ctx.steps.add(retStep);

            return retVal;
        }

        // 4. Built-in Math & Standard Library functions
        if ("max".equals(mName) && mce.getArguments().size() == 2) {
            double a = ((Number) evalExpression(mce.getArgument(0), ctx, startTime)).doubleValue();
            double b = ((Number) evalExpression(mce.getArgument(1), ctx, startTime)).doubleValue();
            return (int) Math.max(a, b);
        }
        if ("min".equals(mName) && mce.getArguments().size() == 2) {
            double a = ((Number) evalExpression(mce.getArgument(0), ctx, startTime)).doubleValue();
            double b = ((Number) evalExpression(mce.getArgument(1), ctx, startTime)).doubleValue();
            return (int) Math.min(a, b);
        }
        if ("abs".equals(mName) && mce.getArguments().size() == 1) {
            double a = ((Number) evalExpression(mce.getArgument(0), ctx, startTime)).doubleValue();
            return (int) Math.abs(a);
        }

        return null;
    }

    private Object evalBinary(BinaryExpr.Operator op, Object left, Object right) {
        if (left instanceof Number ln && right instanceof Number rn) {
            double l = ln.doubleValue();
            double r = rn.doubleValue();
            boolean isInt = (ln instanceof Integer && rn instanceof Integer);
            boolean isLong = (ln instanceof Long || rn instanceof Long);

            switch (op) {
                case PLUS: return isInt ? (ln.intValue() + rn.intValue()) : (isLong ? (ln.longValue() + rn.longValue()) : (l + r));
                case MINUS: return isInt ? (ln.intValue() - rn.intValue()) : (isLong ? (ln.longValue() - rn.longValue()) : (l - r));
                case MULTIPLY: return isInt ? (ln.intValue() * rn.intValue()) : (isLong ? (ln.longValue() * rn.longValue()) : (l * r));
                case DIVIDE: {
                    if (isInt) {
                        return rn.intValue() != 0 ? (ln.intValue() / rn.intValue()) : 0;
                    }
                    if (isLong) {
                        return rn.longValue() != 0 ? (ln.longValue() / rn.longValue()) : 0L;
                    }
                    return r != 0 ? (l / r) : 0.0;
                }
                case REMAINDER: return isInt ? (ln.intValue() % rn.intValue()) : (isLong ? (ln.longValue() % rn.longValue()) : (l % r));
                case LESS: return l < r;
                case LESS_EQUALS: return l <= r;
                case GREATER: return l > r;
                case GREATER_EQUALS: return l >= r;
                case EQUALS: return l == r;
                case NOT_EQUALS: return l != r;
                default: break;
            }
        }

        if (left instanceof String || right instanceof String) {
            if (op == BinaryExpr.Operator.PLUS) {
                return formatVal(left) + formatVal(right);
            }
        }

        if (left instanceof Boolean lb && right instanceof Boolean rb) {
            if (op == BinaryExpr.Operator.AND) return lb && rb;
            if (op == BinaryExpr.Operator.OR) return lb || rb;
            if (op == BinaryExpr.Operator.EQUALS) return lb.equals(rb);
            if (op == BinaryExpr.Operator.NOT_EQUALS) return !lb.equals(rb);
        }

        if (op == BinaryExpr.Operator.EQUALS) {
            return Objects.equals(left, right);
        }
        if (op == BinaryExpr.Operator.NOT_EQUALS) {
            return !Objects.equals(left, right);
        }

        return false;
    }

    private Object evalUnary(UnaryExpr ue, ExecutionContext ctx, long startTime) {
        UnaryExpr.Operator op = ue.getOperator();
        Expression expr = ue.getExpression();

        if (expr.isNameExpr()) {
            String name = expr.asNameExpr().getNameAsString();
            Object cur = ctx.variables.get(name);
            if (cur instanceof Number n) {
                long val = n.longValue();
                if (op == UnaryExpr.Operator.POSTFIX_INCREMENT) {
                    ctx.variables.put(name, (int)(val + 1));
                    return (int)val;
                } else if (op == UnaryExpr.Operator.PREFIX_INCREMENT) {
                    ctx.variables.put(name, (int)(val + 1));
                    return (int)(val + 1);
                } else if (op == UnaryExpr.Operator.POSTFIX_DECREMENT) {
                    ctx.variables.put(name, (int)(val - 1));
                    return (int)val;
                } else if (op == UnaryExpr.Operator.PREFIX_DECREMENT) {
                    ctx.variables.put(name, (int)(val - 1));
                    return (int)(val - 1);
                }
            }
        }

        Object evaluated = evalExpression(expr, ctx, startTime);
        if (op == UnaryExpr.Operator.LOGICAL_COMPLEMENT && evaluated instanceof Boolean b) {
            return !b;
        }
        if (op == UnaryExpr.Operator.MINUS && evaluated instanceof Number num) {
            if (num instanceof Integer) return -num.intValue();
            if (num instanceof Long) return -num.longValue();
            return -num.doubleValue();
        }
        return evaluated;
    }

    private Object applyAssignOp(AssignExpr.Operator op, Object prev, Object right) {
        if (op == AssignExpr.Operator.ASSIGN || prev == null) {
            return right;
        }
        if (prev instanceof Number pn && right instanceof Number rn) {
            double p = pn.doubleValue();
            double r = rn.doubleValue();
            switch (op) {
                case PLUS: return (pn instanceof Integer && rn instanceof Integer) ? (pn.intValue() + rn.intValue()) : (p + r);
                case MINUS: return (pn instanceof Integer && rn instanceof Integer) ? (pn.intValue() - rn.intValue()) : (p - r);
                case MULTIPLY: return (pn instanceof Integer && rn instanceof Integer) ? (pn.intValue() * rn.intValue()) : (p * r);
                case DIVIDE: return r != 0 ? (pn.intValue() / rn.intValue()) : 0;
                default: break;
            }
        }
        if (prev instanceof String || right instanceof String) {
            if (op == AssignExpr.Operator.PLUS) {
                return formatVal(prev) + formatVal(right);
            }
        }
        return right;
    }

    private Object getDefaultValue(String type) {
        if (type.contains("[]") || type.contains("List")) return new ArrayList<>();
        if ("int".equals(type) || "long".equals(type) || "short".equals(type) || "byte".equals(type)) return 0;
        if ("double".equals(type) || "float".equals(type)) return 0.0;
        if ("boolean".equals(type)) return false;
        if ("char".equals(type)) return ' ';
        if ("String".equals(type)) return "";
        return null;
    }

    private int getSourceLine(Node node, ExecutionContext ctx) {
        if (node.getBegin().isPresent()) {
            int line = node.getBegin().get().line - ctx.lineOffset;
            int finalLine = Math.max(1, line);
            ctx.currentLine = finalLine;
            return finalLine;
        }
        return ctx.currentLine;
    }

    private void checkLimits(ExecutionContext ctx, long startTime) {
        if (ctx.stepCounter > MAX_EXECUTION_STEPS) {
            throw new StepLimitExceededException("Step limit of " + MAX_EXECUTION_STEPS + " exceeded (possible infinite loop)");
        }
        if (System.currentTimeMillis() - startTime > MAX_EXECUTION_TIME_MS) {
            throw new ExecutionTimeoutException("Execution timeout exceeded");
        }
    }

    private String formatVal(Object val) {
        if (val == null) return "null";
        if (val instanceof List<?> list) {
            return list.toString();
        }
        if (val instanceof Double || val instanceof Float) {
            double d = ((Number) val).doubleValue();
            if (d == (long) d) {
                return String.valueOf((long) d);
            }
        }
        return String.valueOf(val);
    }

    // ==========================================
    // Internal Execution Context
    // ==========================================
    private static class ExecutionContext {
        final int lineOffset;
        int stepCounter = 1;
        int currentLine = 1;
        final Map<String, Object> variables = new LinkedHashMap<>();
        final Map<String, String> variableTypes = new LinkedHashMap<>();
        final Deque<Map<String, Object>> scopeStack = new ArrayDeque<>();
        final Deque<String> callStack = new ArrayDeque<>();
        final Map<String, MethodDeclaration> methodMap = new LinkedHashMap<>();
        final List<String> stdout = new ArrayList<>();
        final List<ExecutionStep> steps = new ArrayList<>();

        final Queue<String> stdinStream = new LinkedList<>();
        int autoIntIdx = 0;
        int autoStrIdx = 0;

        ExecutionContext(int lineOffset, String input) {
            this.lineOffset = lineOffset;
            if (input != null && !input.isBlank()) {
                String[] lines = input.split("\r?\n");
                for (String l : lines) {
                    String trimmed = l.trim();
                    if (!trimmed.isEmpty()) {
                        stdinStream.add(trimmed);
                    }
                }
            }
        }

        String getNextStringInput() {
            if (!stdinStream.isEmpty()) {
                return stdinStream.poll();
            }
            String[] defaults = { "Himanshu", "Computer Science", "Section A", "CODE3D", "Java" };
            return defaults[(autoStrIdx++) % defaults.length];
        }

        int getNextIntInput() {
            if (!stdinStream.isEmpty()) {
                try {
                    return Integer.parseInt(stdinStream.poll());
                } catch (Exception ignored) {}
            }
            int[] defaults = { 85, 90, 95, 88, 92 };
            return defaults[(autoIntIdx++) % defaults.length];
        }

        double getNextDoubleInput() {
            if (!stdinStream.isEmpty()) {
                try {
                    return Double.parseDouble(stdinStream.poll());
                } catch (Exception ignored) {}
            }
            double[] defaults = { 85.0, 90.0, 95.5 };
            return defaults[(autoIntIdx++) % defaults.length];
        }

        DataStructureState buildDataStructureState(String label, String focusInfo) {
            DataStructureState ds = new DataStructureState();
            ds.setLabel(label);
            ds.setFocusInfo(focusInfo);

            String mainArrayName = null;
            List<Object> arrayValues = null;

            for (Map.Entry<String, Object> entry : variables.entrySet()) {
                if (entry.getValue() instanceof List<?> list && !list.isEmpty()) {
                    mainArrayName = entry.getKey();
                    arrayValues = new ArrayList<>(list);
                    break;
                }
            }

            if (mainArrayName != null && arrayValues != null && !arrayValues.isEmpty()) {
                ds.setType("array");
                ds.setName(mainArrayName);
                ds.setValues(arrayValues);

                Map<String, Object> ptrs = new LinkedHashMap<>();
                for (Map.Entry<String, Object> entry : variables.entrySet()) {
                    if (entry.getValue() instanceof Integer intVal) {
                        if (!entry.getKey().equals(mainArrayName) && intVal >= 0 && intVal < arrayValues.size()) {
                            ptrs.put(entry.getKey(), intVal);
                            ds.setActiveIndex(intVal);
                        }
                    }
                }
                ds.setPointers(ptrs);
            } else {
                ds.setType("universal-execution");
                ds.setName("Memory Space");
            }

            return ds;
        }
    }

    private static class ReturnException extends RuntimeException {
        private final Object value;
        ReturnException(Object value) { this.value = value; }
        public Object getValue() { return value; }
    }

    private static class BreakException extends RuntimeException {}
    private static class ContinueException extends RuntimeException {}

    private static class ExecutionTimeoutException extends RuntimeException {
        ExecutionTimeoutException(String msg) { super(msg); }
    }

    private static class StepLimitExceededException extends RuntimeException {
        StepLimitExceededException(String msg) { super(msg); }
    }

    private static class UnsupportedConstructException extends RuntimeException {
        UnsupportedConstructException(String msg) { super(msg); }
    }
}
