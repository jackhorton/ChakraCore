//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------
#include "Runtime.h"
#include "Core/AtomLockGuids.h"
#include "Core/ConfigParser.h"
#include "Base/ThreadContextTlsEntry.h"
#include "Base/ThreadBoundThreadContextManager.h"
#ifdef DYNAMIC_PROFILE_STORAGE
#include "Language/DynamicProfileStorage.h"
#endif
#include "JsrtContext.h"
#include "TestHooks.h"
#ifdef VTUNE_PROFILING
#include "Base/VTuneChakraProfile.h"
#endif
#ifdef ENABLE_JS_ETW
#include "Base/EtwTrace.h"
#endif

/****************************** Public Functions *****************************/
EXTERN_C BOOL WINAPI DllMain(HINSTANCE hmod, DWORD dwReason, PVOID pvReserved)
{
    switch (dwReason)
    {
    case DLL_PROCESS_ATTACH:
        return JsInitialization::AttachProcess(hmod);
    case DLL_THREAD_ATTACH:
        return JsInitialization::AttachThread();
    case DLL_THREAD_DETACH:
        return JsInitialization::DetachThread();
    case DLL_PROCESS_DETACH:
        return JsInitialization::DetachProcess(pvReserved);
    default:
        AssertMsg(FALSE, "DllMain() called with unrecognized dwReason.");
        return FALSE;
    }
}
